from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TerritorioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome_local: str
    tipo_ecossistema: str
    latitude: float
    longitude: float
    ponto_apoio_proximo: str
    fator_vulnerabilidade: Optional[str] = None


class AlertaTerritorialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    territorio_id: int = Field(default=1, description="ID do território monitorado")
    territorio: str = Field(..., description="Nome do bairro ou comunidade")
    ecossistema: str = Field(..., description="Tipo de ecossistema local (Encosta, Manguezal, Rio)")
    precipitacao_mm: float = Field(..., description="Volume de chuva atual em mm/h")
    temperatura_c: float = Field(..., description="Temperatura atual em °C")
    nivel_risco: str = Field(..., description="Nível de risco: BAIXO, MODERADO ou CRÍTICO")
    alerta_humanizado: str = Field(..., description="Mensagem traduzida em linguagem simples e acessível")
    acao_segura: str = Field(..., description="Orientação prática imediata para o morador")
    cuidado_ambiental: str = Field(..., description="Dica de preservação de rios, mangues e encostas")
    ponto_apoio: str = Field(..., description="Escola ou ponto de abrigo municipal mais próximo")
    fator_vulnerabilidade: Optional[str] = Field(default=None, description="Fator territorial de atenção")
    fonte_ia: str = Field(default="deterministico_validado", description="Origem da tradução (gemini_ia ou deterministico_validado)")
    atualizado_em: str = Field(
        default_factory=lambda: datetime.now().isoformat(),
        description="Timestamp ISO da leitura do alerta",
    )


class SimularCriseRequest(BaseModel):
    precipitacao_mm: float = Field(default=45.0, ge=0.0, le=500.0, description="Volume de chuva simulado em mm/h")

