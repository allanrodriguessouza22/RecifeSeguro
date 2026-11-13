from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import AlertaGerado, TerritorioRisco
from .schemas import AlertaTerritorialResponse, SimularCriseRequest, TerritorioResponse
from .services.ai_translator import traduzir_alerta_com_ia, traduzir_alerta_deterministico
from .services.weather_service import buscar_clima_open_meteo

# Seed oficial de territórios vulneráveis de Recife/PE (Baseado nos Dados Abertos do Recife)
SEED_TERRITORIOS = [
    {
        "id": 1,
        "nome_local": "Morro da Conceição (Zona Norte)",
        "tipo_ecossistema": "Encosta/Morro",
        "latitude": -8.0264,
        "longitude": -34.9189,
        "ponto_apoio_proximo": "Escola Municipal Prof. Solano Trindade",
        "fator_vulnerabilidade": "Alta declividade e solo encharcado em chuvas intensas",
    },
    {
        "id": 2,
        "nome_local": "Ilha Joana Bezerra / Coque (Centro)",
        "tipo_ecossistema": "Manguezal / Margem de Rio",
        "latitude": -8.0753,
        "longitude": -34.8967,
        "ponto_apoio_proximo": "Escola Municipal Karla Patrícia",
        "fator_vulnerabilidade": "Influência da maré do Rio Capibaribe e canais de drenagem",
    },
    {
        "id": 3,
        "nome_local": "UR-02 Ibura (Zona Sul)",
        "tipo_ecossistema": "Encosta/Morro",
        "latitude": -8.1256,
        "longitude": -34.9458,
        "ponto_apoio_proximo": "Escola Municipal Sociólogo Gilberto Freyre",
        "fator_vulnerabilidade": "Barreiras sujeitas a deslizamento e acúmulo de água",
    },
    {
        "id": 4,
        "nome_local": "Córrego do Jenipapo (Zona Norte)",
        "tipo_ecossistema": "Encosta / Margem de Córrego",
        "latitude": -8.0158,
        "longitude": -34.9364,
        "ponto_apoio_proximo": "Escola Municipal Córrego do Jenipapo",
        "fator_vulnerabilidade": "Transbordamento rápido do córrego e encostas adjacentes",
    },
    {
        "id": 5,
        "nome_local": "Ilha de Deus / Imbiribeira (Zona Sul)",
        "tipo_ecossistema": "Estuário / Manguezal",
        "latitude": -8.0975,
        "longitude": -34.9092,
        "ponto_apoio_proximo": "Escola Municipal Paulo VI",
        "fator_vulnerabilidade": "Encontro dos rios Jordão, Tejipió e Pina com maré alta",
    },
]


def inicializar_banco() -> None:
    """Cria tabelas e popula os territórios iniciais de Recife caso o banco esteja vazio."""
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            if db.query(TerritorioRisco).count() == 0:
                for item in SEED_TERRITORIOS:
                    db.add(TerritorioRisco(**item))
                db.commit()
        finally:
            db.close()
    except Exception:
        # Em caso de falha transitória de banco externo, o fallback em memória garante disponibilidade
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    inicializar_banco()
    yield


app = FastAPI(
    title="Recife Seguro API - Antena na Lama",
    description=(
        "T.A.D.C. (Tradutor de Alertas da Defesa Civil) com foco territorial em "
        "Recife/PE — Conectando a tecnologia à proteção de rios, mangues e encostas."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _obter_territorio_seguro(db: Session, territorio_id: int) -> dict:
    """Busca o território no banco de dados ou utiliza o seed oficial como fallback."""
    try:
        inicializar_banco()
        registro = db.query(TerritorioRisco).filter(TerritorioRisco.id == territorio_id).first()
        if registro:
            return {
                "id": registro.id,
                "nome_local": registro.nome_local,
                "tipo_ecossistema": registro.tipo_ecossistema,
                "latitude": registro.latitude,
                "longitude": registro.longitude,
                "ponto_apoio_proximo": registro.ponto_apoio_proximo,
                "fator_vulnerabilidade": registro.fator_vulnerabilidade,
            }
    except Exception:
        pass

    for item in SEED_TERRITORIOS:
        if item["id"] == territorio_id:
            return item

    raise HTTPException(status_code=404, detail="Território não encontrado")


@app.get("/api/v1/health")
async def health_check(db: Session = Depends(get_db)):
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "online",
        "projeto": "Recife Seguro - PWA",
        "desafio": "Antena na Lama - Caminho 2 (Alertar e Proteger)",
        "database_connected": db_ok,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/v1/territorios", response_model=List[TerritorioResponse])
async def listar_territorios(db: Session = Depends(get_db)):
    """Lista os territórios vulneráveis monitorados em Recife (encostas, rios e mangues)."""
    try:
        inicializar_banco()
        registros = db.query(TerritorioRisco).order_by(TerritorioRisco.id).all()
        if registros:
            return registros
    except Exception:
        pass
    return [TerritorioResponse(**t) for t in SEED_TERRITORIOS]


@app.get("/api/v1/alerta/{territorio_id}", response_model=AlertaTerritorialResponse)
async def obter_alerta_territorial(
    territorio_id: int,
    simular_chuva: Optional[float] = Query(
        default=None,
        ge=0.0,
        le=500.0,
        description="Volume de chuva simulado (mm/h) para demonstração no Pitch",
    ),
    db: Session = Depends(get_db),
):
    """
    Consulta a Open-Meteo em tempo real usando latitude e longitude do território,
    classifica o risco de forma determinística e aciona a IA para traduzir o alerta
    em linguagem acessível com orientação de segurança e preservação ambiental.
    """
    local = _obter_territorio_seguro(db, territorio_id)

    clima = await buscar_clima_open_meteo(local["latitude"], local["longitude"])
    chuva_atual = float(simular_chuva) if simular_chuva is not None else float(clima["precipitation"])
    temp_atual = float(clima["temperature_2m"])

    traducao = await traduzir_alerta_com_ia(
        territorio=local["nome_local"],
        ecossistema=local["tipo_ecossistema"],
        chuva_mm=chuva_atual,
        ponto_apoio=local["ponto_apoio_proximo"],
        fator_vulnerabilidade=local.get("fator_vulnerabilidade"),
    )

    # Registra auditoria do alerta gerado no banco de dados
    try:
        novo_alerta = AlertaGerado(
            territorio_id=local["id"],
            precipitacao_mm=chuva_atual,
            temperatura_c=temp_atual,
            nivel_risco=traducao["nivel_risco"],
            dados_brutos_api=clima["raw"],
            mensagem_traduzida_ia=traducao["alerta_humanizado"],
            acao_segura=traducao["acao_segura"],
            preservacao_ambiental=traducao["cuidado_ambiental"],
        )
        db.add(novo_alerta)
        db.commit()
    except Exception:
        db.rollback()

    return AlertaTerritorialResponse(
        territorio_id=local["id"],
        territorio=local["nome_local"],
        ecossistema=local["tipo_ecossistema"],
        precipitacao_mm=chuva_atual,
        temperatura_c=temp_atual,
        nivel_risco=traducao["nivel_risco"],
        alerta_humanizado=traducao["alerta_humanizado"],
        acao_segura=traducao["acao_segura"],
        cuidado_ambiental=traducao["cuidado_ambiental"],
        ponto_apoio=local["ponto_apoio_proximo"],
        fator_vulnerabilidade=local.get("fator_vulnerabilidade"),
        fonte_ia=traducao.get("fonte_ia", "deterministico_validado"),
        atualizado_em=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/api/v1/simular-crise/{territorio_id}", response_model=AlertaTerritorialResponse)
async def simular_crise_climatica(
    territorio_id: int,
    payload: Optional[SimularCriseRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Endpoint de demonstração para o Pitch: simula chuva extrema (padrão 45.0 mm/h)
    para comprovar o comportamento da IA e o acionamento do protocolo de crise ao vivo.
    """
    chuva_simulada = payload.precipitacao_mm if payload is not None else 45.0
    return await obter_alerta_territorial(
        territorio_id=territorio_id,
        simular_chuva=chuva_simulada,
        db=db,
    )


# Exporta a função auxiliar determinística para compatibilidade direta nos testes unitários
def traduzir_alerta_simples(territorio: str, ecossistema: str, chuva_mm: float, ponto_apoio: str) -> dict:
    return traduzir_alerta_deterministico(territorio, ecossistema, chuva_mm, ponto_apoio)

