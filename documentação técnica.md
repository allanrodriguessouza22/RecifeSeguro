# DOCUMENTAÇÃO TÉCNICA E PRD: HACKATHON RECIFE SEGURO (CICLO VIVO)

## 1. Visão Geral e Contexto do Projeto

* **Nome da Solução:** Recife Seguro: T.A.D.C. (Tradutor de Alertas da Defesa Civil) com Foco Territorial.

* **Evento:** Hackathon APONTI Academy: Devs Criam com IA (REC'n'Play 2026) — Desafio *Antena na Lama*.

* **Inspiração:** Manifesto *Caranguejos com Cérebro* (Manguebeat), conectando a tecnologia ao território e à proteção dos rios, mangues e encostas da Região Metropolitana do Recife (RMR).

* **Caminho Escolhido:** **Caminho 2 - Alertar e Proteger (durante a crise)**.

* **Alinhamento ODS:** ODS 13 (Ação contra a Mudança Global do Clima), ODS 11 (Cidades e Comunidades Sustentáveis) e ODS 6 (Água Potável e Saneamento).

### 1.1. O Problema Resolvido

Os eventos climáticos extremos (chuvas fortes, alagamentos, deslizamentos de barreiras e calor intenso) atingem severamente a RMR. Embora existam dados meteorológicos oficiais (APAC, Cemaden, Defesa Civil), as informações frequentemente chegam tarde, em linguagem excessivamente técnica e por canais inacessíveis para quem mais sofre nas encostas e margens de rios/mangues.

### 1.2. A Solução Proposta

Um **PWA (Progressive Web App)** leve, acessível, de baixo consumo de dados e instalável na tela inicial de smartphones (incluindo dispositivos de entrada), que:

1. Consome dados meteorológicos em tempo real via API aberta (**Open-Meteo**) e bases territoriais abertas da Prefeitura do Recife (`dados.recife.pe.gov.br`).

2. Utiliza **IA Generativa com propósito** para traduzir boletins técnicos e volumes de precipitação em alertas claros, humanizados e contextualizados para o território (alertando sobre riscos específicos em encostas, canais e áreas de mangue).

3. Guia o cidadão com recomendações práticas de segurança ("o que fazer agora") e pontos de apoio seguros.

### 1.3. Indicador de Resultado (Métrica de Impacto)

* **Indicador:** Redução do tempo de compreensão e propagação do alerta de risco climático — convertendo dados técnicos brutos em orientações territoriais acessíveis em menos de **3 segundos**, com linguagem validada por moradores locais (jovens do Movimento Pró-Criança).

## 2. Stack Tecnológica Oficial

* **Backend:** Python 3.11+ com **FastAPI**, Uvicorn, Pydantic v2, HTTPX (requisições assíncronas) e SQLAlchemy (ORM).

* **Inteligência Artificial:** Integração via API (ex: Google Gemini API) para tradução semântica, simplificação de linguagem e contextualização territorial de alertas.

* **Frontend:** **Angular** (versão recente com Standalone Components) + **Tailwind CSS** + **Angular Service Worker (`@angular/pwa`)** para suporte offline e instalação mobile.

* **Banco de Dados:** **PostgreSQL** (via Neon / Vercel Postgres).

* **Testes e CI:** `pytest` (no backend Python) e Jasmine/Karma ou Jest (no frontend Angular) integrados ao GitHub Actions.

* **Deploy:** **Vercel** (Frontend Angular como Static/SPA e Backend FastAPI adaptado via `vercel.json` como Serverless Function Python no mesmo projeto ou projetos integrados).

## 3. Arquitetura de Banco de Dados (PostgreSQL)

Abaixo está o esquema relacional para armazenar os territórios vulneráveis de Recife (bairros, morros, áreas de mangue/alagamento) e o histórico de alertas traduzidos pela IA.

```sql
-- Tabela de Territórios e Zonas de Risco em Recife (Baseada nos Dados Abertos da Prefeitura)
CREATE TABLE territorios_risco (
    id SERIAL PRIMARY KEY,
    nome_local VARCHAR(120) NOT NULL,          -- Ex: Morro da Conceição, Joana Bezerra, Ibura
    tipo_ecossistema VARCHAR(50) NOT NULL,     -- Ex: Encosta/Morro, Margem de Rio/Canal, Manguezal
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ponto_apoio_proximo VARCHAR(200) NOT NULL, -- Ex: Escola Municipal Alto da Bondade
    fator_vulnerabilidade TEXT
);

-- Tabela de Alertas Meteorológicos e Traduções Geradas por IA
CREATE TABLE alertas_gerados (
    id SERIAL PRIMARY KEY,
    territorio_id INTEGER REFERENCES territorios_risco(id) ON DELETE CASCADE,
    precipitacao_mm DOUBLE PRECISION NOT NULL,
    temperatura_c DOUBLE PRECISION,
    nivel_risco VARCHAR(20) NOT NULL,          -- Baixo, Moderado, Alto, Crítico
    dados_brutos_api JSONB NOT NULL,           -- Payload original da Open-Meteo (auditoria)
    mensagem_traduzida_ia TEXT NOT NULL,       -- Alerta em linguagem simples gerado pela IA
    acao_segura TEXT NOT NULL,                 -- Instrução direta ao morador
    preservacao_ambiental TEXT NOT NULL,       -- Dica de cuidado com rios/mangues/encostas
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed inicial com dados reais de referência de Recife/PE
INSERT INTO territorios_risco (nome_local, tipo_ecossistema, latitude, longitude, ponto_apoio_proximo, fator_vulnerabilidade)
VALUES 
('Morro da Conceição (Zona Norte)', 'Encosta/Morro', -8.0264, -34.9189, 'Escola Municipal Prof. Solano Trindade', 'Alta declividade e solo encharcado em chuvas intensas'),
('Ilha Joana Bezerra / Coque (Centro)', 'Manguezal / Margem de Rio', -8.0753, -34.8967, 'Escola Municipal Karla Patrícia', 'Influência da maré do Rio Capibaribe e canais de drenagem'),
('UR-02 Ibura (Zona Sul)', 'Encosta/Morro', -8.1256, -34.9458, 'Escola Municipal Sociólogo Gilberto Freyre', 'Barreiras sujeitas a deslizamento e acúmulo de água');
```

## 4. Contratos da API e Lógica do Backend (FastAPI)

### 4.1. Estrutura de Pastas Recomendada (Monorepo adaptado para Vercel)

```text
recife-seguro-hackathon/
├── api/                         # Serverless Functions Python na Vercel (ou /backend)
│   └── index.py                 # Entrypoint expondo a instância `app` do FastAPI
├── backend/
│   ├── app/
│   │   ├── main.py              # Ponto de entrada FastAPI e CORS
│   │   ├── database.py          # Conexão SQLAlchemy + PostgreSQL
│   │   ├── models.py            # Modelos ORM
│   │   ├── schemas.py           # Schemas Pydantic
│   │   └── services/
│   │       ├── weather_service.py # Integração com Open-Meteo
│   │       └── ai_translator.py   # Serviço de tradução com IA + fallback seguro
│   ├── tests/
│   │   └── test_api.py          # Testes automatizados obrigatórios (mínimo 3)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Cards de Alerta, Seletor de Bairro, Guia Rápido
│   │   │   └── services/        # AlertaService (HttpClient)
│   │   └── manifest.webmanifest # Configuração PWA
│   └── angular.json
├── vercel.json                  # Roteamento de /api/* para FastAPI e /* para Angular
└── README.md                    # Preenchido conforme modelo oficial da APONTI
```

### 4.2. Endpoints Principais

* `GET /api/v1/health` — Verifica status da API e conexão com o banco.

* `GET /api/v1/territorios` — Lista os bairros/ecossistemas monitorados em Recife.

* `GET /api/v1/alerta/{territorio_id}` — Consulta a **Open-Meteo** em tempo real usando `latitude` e `longitude` do território, classifica o risco e aciona a IA para gerar o alerta humanizado + orientação ambiental.

* `POST /api/v1/simular-crise/{territorio_id}` — Endpoint de demonstração para o Pitch (permite simular chuva extrema de `45mm/h` para provar o comportamento da IA ao vivo para a banca).

### 4.3. Implementação de Referência (`backend/app/main.py`)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(
    title="Recife Seguro API - Antena na Lama",
    description="Tradutor inteligente de alertas climáticos com foco territorial em Recife/PE",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AlertaTerritorialResponse(BaseModel):
    territorio: str
    ecossistema: str
    precipitacao_mm: float
    temperatura_c: float
    nivel_risco: str
    alerta_humanizado: str
    acao_segura: str
    cuidado_ambiental: str
    ponto_apoio: str

def traduzir_alerta_com_ia(territorio: str, ecossistema: str, chuva_mm: float, ponto_apoio: str) -> dict:
    """
    Camada de inteligência: converte dados meteorológicos técnicos em linguagem simples,
    contextualizada para o território e com foco na preservação de rios, mangues e encostas.
    (Pode ser conectada diretamente à API do Google Gemini com fallback determinístico).
    """
    if chuva_mm >= 15.0:
        return {
            "nivel_risco": "CRÍTICO",
            "alerta_humanizado": f"Atenção urgente em {territorio}! Está chovendo muito forte agora ({chuva_mm} mm/h). Há risco imediato de deslizamento de barreira ou alagamento rápido.",
            "acao_segura": f"Saia de áreas de encosta ou beira de canal imediatamente e procure abrigo seguro em: {ponto_apoio}.",
            "cuidado_ambiental": "Não tente desentupir bueiros durante a enxurrada e mantenha distância das margens dos rios e mangues."
        }
    elif chuva_mm >= 5.0:
        return {
            "nivel_risco": "MODERADO",
            "alerta_humanizado": f"Fique ligado, morador de {territorio}: chuva moderada ({chuva_mm} mm/h) atingindo a região de {ecossistema}. O solo já começa a acumular água.",
            "acao_segura": f"Separe documentos em saco plástico, carregue o celular e deixe a rota pronta até: {ponto_apoio}.",
            "cuidado_ambiental": "Nunca descarte lixo nas encostas ou canais; o lixo bloqueia o escoamento natural para o mangue e causa alagamentos."
        }
    else:
        return {
            "nivel_risco": "BAIXO",
            "alerta_humanizado": f"Tudo tranquilo em {territorio} no momento ({chuva_mm} mm/h). Sem risco imediato de chuva forte.",
            "acao_segura": "Acompanhe as atualizações pelo aplicativo e revise o plano de segurança da sua família.",
            "cuidado_ambiental": f"Proteger a área de {ecossistema} hoje evita tragédias amanhã: descarte resíduos apenas nos pontos de coleta."
        }

@app.get("/api/v1/health")
async def health_check():
    return {"status": "online", "projeto": "Recife Seguro - PWA"}

@app.get("/api/v1/alerta/{territorio_id}", response_model=AlertaTerritorialResponse)
async def obter_alerta_territorial(territorio_id: int, simular_chuva: float | None = None):
    # Dados de exemplo integrados (em produção, buscar da tabela territorios_risco no PostgreSQL)
    territorios_mock = {
        1: {"nome": "Morro da Conceição", "eco": "Encosta/Morro", "lat": -8.0264, "lon": -34.9189, "apoio": "Escola Municipal Prof. Solano Trindade"},
        2: {"nome": "Ilha Joana Bezerra", "eco": "Manguezal / Rio Capibaribe", "lat": -8.0753, "lon": -34.8967, "apoio": "Escola Municipal Karla Patrícia"},
        3: {"nome": "UR-02 Ibura", "eco": "Encosta/Morro", "lat": -8.1256, "lon": -34.9458, "apoio": "Escola Municipal Sociólogo Gilberto Freyre"}
    }

    if territorio_id not in territorios_mock:
        raise HTTPException(status_code=404, detail="Território não encontrado")

    local = territorios_mock[territorio_id]
    url = f"https://api.open-meteo.com/v1/forecast?latitude={local['lat']}&longitude={local['lon']}&current=temperature_2m,precipitation"

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Falha na comunicação com Open-Meteo")
        clima = resp.json().get("current", {})

    chuva_atual = simular_chuva if simular_chuva is not None else clima.get("precipitation", 0.0)
    temp_atual = clima.get("temperature_2m", 28.0)

    traducao = traduzir_alerta_com_ia(local["nome"], local["eco"], chuva_atual, local["apoio"])

    return AlertaTerritorialResponse(
        territorio=local["nome"],
        ecossistema=local["eco"],
        precipitacao_mm=chuva_atual,
        temperatura_c=temp_atual,
        nivel_risco=traducao["nivel_risco"],
        alerta_humanizado=traducao["alerta_humanizado"],
        acao_segura=traducao["acao_segura"],
        cuidado_ambiental=traducao["cuidado_ambiental"],
        ponto_apoio=local["apoio"]
    )
```

## 5. Especificações do Frontend (Angular + Tailwind + PWA)

### 5.1. Requisitos de Interface e Acessibilidade (Regras do Edital)

* **Mobile-First e Leveza:** Otimizado para telas pequenas e conexões 3G/4G instáveis.

* **Acessibilidade Universal:**

  * Alto contraste entre texto e fundo (WCAG AA/AAA).

  * Fontes legíveis (mínimo `16px` para leitura de alertas).

  * Navegação por teclado e atributos `aria-label` nos botões principais.

  * Botão opcional de **Leitura em Voz Alta** (usando a API nativa `window.speechSynthesis` do navegador em `pt-BR` para moradores com baixa escolaridade ou deficiência visual).

* **PWA Real:**

  * Configurar `@angular/pwa` com `ngsw-config.json` fazendo cache do *App Shell* e do último alerta recebido (permitindo consulta offline caso a internet caia durante o temporal).

### 5.2. Fluxo de Telas (Single-Page Simplificada)

1. **Cabeçalho:** Nome do App (*Recife Seguro*), selo de status online/offline e seletor rápido de comunidade/bairro (ex: *Morro da Conceição*, *Joana Bezerra*, *Ibura*).

2. **Card Principal de Risco (Semáforo Visual):**

   * Fundo dinâmico conforme o risco: Verde (`BAIXO`), Amarelo/Laranja (`MODERADO`), Vermelho (`CRÍTICO`).

   * Exibe a mensagem traduzida pela IA em destaque, botão **"Ouvir Alerta"** (Web Speech API) e dados climáticos resumidos (`mm/h` de chuva e `°C`).

3. **Card "O Que Fazer Agora" & Ponto de Apoio:**

   * Instrução prática de proteção e endereço do abrigo/escola municipal mais próxima.

4. **Card "Cuidando do Nosso Território" (Mangues, Rios e Encostas):**

   * Alerta educativo contextualizado conectando a proteção do ecossistema local à prevenção de desastres na comunidade.

5. **Modo Demonstração (Rodapé discreto para o Pitch):**

   * Botão *"Simular Chuva Forte"* que envia `?simular_chuva=22.5` para a API, demonstrando em tempo real a mudança de estado e a resposta da IA durante a apresentação de 3 minutos.

## 6. Requisitos Obrigatórios do Edital (Checklist Code Freeze)

1. **Deploy Público (Vercel):** Frontend Angular e Backend FastAPI publicados na Vercel com URL pública acessível no celular (e HTTPS nativo para suporte completo a PWA e Service Worker).

2. **Testes Automatizados no CI (Mínimo 3):**

   * *Teste 1:* Health check da API (`/api/v1/health` retornando `200 OK`).

   * *Teste 2:* Validação da lógica de classificação e tradução de risco crítico (`chuva >= 15.0` retornando `nivel_risco == "CRÍTICO"`).

   * *Teste 3:* Tratamento de erro para território inexistente (`/api/v1/alerta/999` retornando `404 Not Found`).

3. **Auditoria de IA e README:** Documentar claramente onde a IA foi utilizada (tradução semântica e contextualização territorial), quais limitações foram corrigidas (uso de regras determinísticas de limiar de chuva para evitar alucinações em situações de risco de vida) e o feedback do validador do Movimento Pró-Criança.

## 7. Prompt Mestre para Enviar ao Gemini 4 Argon (Antigravity)

Copie e cole o bloco abaixo no Antigravity junto com esta documentação:

```text
Atue como Arquiteto de Software Sênior e Desenvolvedor Fullstack especialista em Python (FastAPI), Angular, PostgreSQL e PWAs. 

Com base na documentação técnica acima ("Recife Seguro - Hackathon Antena na Lama"), construa o repositório completo e funcional pronto para deploy na Vercel, seguindo rigorosamente estas entregas:

1. BACKEND (Python + FastAPI + PostgreSQL):
   - Crie a estrutura completa em `/backend` com SQLAlchemy, Pydantic, HTTPX e suporte a variáveis de ambiente (`DATABASE_URL`, `GEMINI_API_KEY`).
   - Implemente a integração assíncrona com a API Open-Meteo e o serviço de tradução inteligente de alertas com foco territorial (encostas, rios e mangues de Recife), incluindo fallback seguro caso a chave de LLM não esteja configurada.
   - Implemente o parâmetro opcional `simular_chuva` no endpoint de alerta para demonstração ao vivo no pitch.
   - Crie o arquivo `/backend/tests/test_api.py` com pelo menos 4 testes automatizados usando `pytest` e `TestClient` cobrindo os cenários de risco baixo, moderado, crítico e erro 404.

2. FRONTEND (Angular + Tailwind CSS + PWA):
   - Crie a aplicação Angular moderna em `/frontend` utilizando Standalone Components e Tailwind CSS.
   - Configure o suporte PWA (`manifest.webmanifest` e Service Worker) para instalação mobile e cache offline do último alerta.
   - Implemente a interface acessível de alto contraste com seletor de territórios de Recife, semáforo visual de risco, leitura em voz alta nativa (`speechSynthesis` em `pt-BR`) e botão discreto de simulação de chuva forte para o pitch.

3. DEVOPS, CI E DEPLOY NA VERCEL:
   - Configure o workflow do GitHub Actions (`.github/workflows/ci.yml`) executando os testes automatizados do backend a cada push.
   - Crie o arquivo `vercel.json` na raiz e o entrypoint Python (`/api/index.py`) para permitir o deploy unificado na Vercel (servindo o build estático do Angular nas rotas de UI e roteando `/api/*` para a aplicação FastAPI como Serverless Function), além de instruções claras para conectar o PostgreSQL (Neon/Vercel Postgres).
   - Gere um `README.md` completo cobrindo: Problema, Caminho 2 (Alertar e Proteger), Arquitetura, Como Rodar Localmente, Indicador de Resultado e Seção de Auditoria Ética de IA.
```