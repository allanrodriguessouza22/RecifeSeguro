# Recife Seguro — T.A.D.C. (Tradutor de Alertas da Defesa Civil)

> **Hackathon APONTI Academy: Devs Criam com IA (REC'n'Play 2026) — Desafio *Antena na Lama***  
> **Caminho Escolhido:** **Caminho 2 — Alertar e Proteger (durante a crise)**  
> **Inspiração:** Manifesto *Caranguejos com Cérebro* (Manguebeat), conectando tecnologia cidadã ao território e à proteção dos rios, mangues e encostas da Região Metropolitana do Recife (RMR).  
> **Alinhamento ODS:** ODS 13 (Ação contra a Mudança Global do Clima), ODS 11 (Cidades e Comunidades Sustentáveis) e ODS 6 (Água Potável e Saneamento).

---

## 1. O Problema e a Solução

### 1.1. O Problema
Eventos climáticos extremos (chuvas intensas, alagamentos, deslizamentos de barreiras e marés altas conjugadas) atingem severamente a Região Metropolitana do Recife. Embora existam dados meteorológicos oficiais (APAC, Cemaden, Defesa Civil), os boletins frequentemente chegam em **linguagem técnica complexa** (ex.: *"precipitação acumulada de 30mm/h com convergência de umidade"*) e dependem de conexões estáveis, dificultando a tomada de decisão rápida por quem vive nas encostas (*Morro da Conceição*, *Ibura*) e margens de rios/mangues (*Ilha Joana Bezerra*, *Ilha de Deus*).

### 1.2. A Solução (*Recife Seguro — T.A.D.C.*)
Um **PWA (Progressive Web App)** leve, acessível (WCAG AA/AAA), instalável no celular e com cache offline automático que:
1. **Monitora o Clima por Território:** Consome dados meteorológicos em tempo real da API aberta **Open-Meteo** cruzados com pontos territoriais vulneráveis e abrigos oficiais baseados nos Dados Abertos da Prefeitura do Recife (`dados.recife.pe.gov.br`).
2. **Traduz Boletins com IA e Guardrails de Segurança:** Utiliza **IA Generativa (Google Gemini)** combinada com regras determinísticas auditáveis para traduzir dados técnicos em alertas humanizados, diretos e compreensíveis em **menos de 3 segundos**.
3. **Orienta e Protege:** Exibe um **Semáforo Visual de Risco** (`BAIXO`, `MODERADO`, `CRÍTICO`), possui **Leitura em Voz Alta nativa (`pt-BR`)** para acessibilidade universal, indica a **Escola/Ponto de Apoio Municipal mais próximo** e educa sobre o cuidado com rios, canais e manguezais.

---

## 2. Indicador de Resultado (Métrica de Impacto)

* **Métrica Principal:** Redução do tempo de compreensão e reação a alertas climáticos — convertendo dados meteorológicos brutos em orientações territoriais acionáveis em **menos de 3 segundos**, com suporte a síntese de voz (`Web Speech API`) e disponibilidade offline.

---

## 3. Arquitetura e Stack Tecnológica

* **Backend:** Python 3.11+ com **FastAPI**, Uvicorn, Pydantic v2, HTTPX (requisições assíncronas à Open-Meteo e Gemini API) e SQLAlchemy 2.0.
* **Banco de Dados:** **PostgreSQL** (Neon / Vercel Postgres) via `DATABASE_URL`, com fallback automático para SQLite local e seed automático dos territórios de risco do Recife.
* **Frontend:** **Angular 18+** (Standalone Components) + **Tailwind CSS** + **Angular Service Worker (`@angular/pwa`)** para instalação mobile e cache offline.
* **Testes e CI:** `pytest` + `TestClient` (7 testes automatizados cobrindo health check, listagem de territórios, riscos baixo/moderado/crítico, simulação de crise e erro 404) integrados ao **GitHub Actions** (`.github/workflows/ci.yml`).
* **Deploy Unificado:** **Vercel** (`vercel.json` + `/api/index.py` Serverless Function Python + Build estático do PWA Angular).

```text
Hackaton-Aponti-/
├── api/
│   └── index.py                  # Entrypoint Serverless Function Python para a Vercel
├── backend/
│   ├── app/
│   │   ├── main.py               # Aplicação FastAPI, rotas e seed territorial
│   │   ├── database.py           # Conexão SQLAlchemy (PostgreSQL Neon / SQLite fallback)
│   │   ├── models.py             # Modelos ORM (TerritorioRisco, AlertaGerado)
│   │   ├── schemas.py            # Contratos Pydantic v2
│   │   └── services/
│   │       ├── weather_service.py # Integração assíncrona com Open-Meteo
│   │       └── ai_translator.py   # Tradutor Gemini IA + Guardrail determinístico
│   ├── sql/
│   │   └── schema.sql            # Script DDL + Seed PostgreSQL
│   ├── tests/
│   │   └── test_api.py           # Testes automatizados com Pytest
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # CardRisco, CardAcaoApoio, CardTerritorioVivo
│   │   │   ├── models/           # Interfaces TypeScript
│   │   │   ├── services/         # AlertaService com cache offline localStorage
│   │   │   └── app.component.ts  # Tela principal mobile-first + Modo Pitch
│   │   └── manifest.webmanifest  # Manifesto PWA
│   ├── ngsw-config.json          # Configuração do Service Worker Offline
│   └── angular.json
├── .github/workflows/ci.yml      # Pipeline de Integração Contínua (Pytest + Build Angular)
├── vercel.json                   # Configuração de roteamento unificado na Vercel
└── README.md
```

---

## 4. Endpoints da API (`/api/v1`)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Verifica o status da API e a conectividade com o banco de dados. |
| `GET` | `/api/v1/territorios` | Lista os bairros e ecossistemas monitorados em Recife (Morro da Conceição, Joana Bezerra, Ibura, etc.). |
| `GET` | `/api/v1/alerta/{territorio_id}` | Consulta a Open-Meteo em tempo real, classifica o risco e traduz o alerta. Aceita `?simular_chuva=22.5` para demonstração. |
| `POST` | `/api/v1/simular-crise/{territorio_id}` | Endpoint de demonstração para o Pitch (simula chuva extrema de `45.0 mm/h`). |

---

## 5. Como Rodar Localmente

### 5.1. Backend (FastAPI)

```bash
# 1. Instalar dependências do Python
python -m pip install -r backend/requirements.txt

# 2. Executar a suite de testes automatizados
python -m pytest backend/tests/test_api.py -v

# 3. Iniciar o servidor FastAPI na porta 8000
python -m uvicorn backend.app.main:app --reload --port 8000
```

A documentação interativa (Swagger UI) ficará disponível em: `http://127.0.0.1:8000/docs`

### 5.2. Frontend (Angular PWA)

```bash
# 1. Entrar na pasta do frontend e instalar pacotes
cd frontend
npm install

# 2. Iniciar o servidor de desenvolvimento (com proxy para http://127.0.0.1:8000)
npm start
```

Acesse no navegador: `http://localhost:4200`

---

## 6. Como Fazer Deploy na Vercel com PostgreSQL (Neon / Vercel Postgres)

1. Importe este repositório na **Vercel**.
2. A Vercel detectará automaticamente o `vercel.json` na raiz:
   * Executará `cd frontend && npm install && npm run build` para gerar o PWA estático com Service Worker ativo.
   * Publicará `/api/index.py` como Serverless Function Python respondendo em `/api/*`.
3. No painel da Vercel (**Settings > Environment Variables** ou aba **Storage**), conecte um banco **Neon / Vercel Postgres**:
   * Defina `DATABASE_URL` com a string de conexão PostgreSQL.
   * *(Opcional)* Defina `GEMINI_API_KEY` para ativar a geração dinâmica via Google Gemini 2.5 Flash.
4. Na inicialização, a aplicação cria automaticamente as tabelas `territorios_risco` e `alertas_gerados` e realiza o seed inicial dos territórios do Recife (ou você pode executar manualmente o script `backend/sql/schema.sql`).

---

## 7. Auditoria Ética de IA e Validação Comunitária

### 7.1. Onde a IA é utilizada
* A IA Generativa (**Google Gemini API**) atua na **tradução semântica e contextualização territorial**, transformando métricas meteorológicas frias (`mm/h`, `°C`, coordenadas e tipo de ecossistema) em mensagens empáticas, diretas e adaptadas à realidade de morros, córregos e áreas de mangue do Recife.

### 7.2. Guardrails Determinísticos contra Alucinações (Segurança de Vida)
* **Limitação identificada:** Modelos de linguagem (LLMs) não devem decidir sozinhos se uma chuva de `20 mm/h` em uma encosta íngreme representa risco baixo ou crítico, nem podem falhar caso a API externa de IA sofra latência durante uma tempestade.
* **Correção implementada:** O cálculo do nível de risco (`BAIXO` `< 5mm/h`, `MODERADO` `5-14.9mm/h`, `CRÍTICO` `>= 15mm/h`) e o vínculo com a Escola Municipal / Ponto de Apoio oficial são **100% determinísticos no código (`classificar_nivel_risco`)**. Além disso, há um **fallback determinístico instantâneo (`< 50ms`)** caso a chave `GEMINI_API_KEY` não esteja configurada ou exceda o timeout de `2.5s`.

### 7.3. Validação de Linguagem e Acessibilidade
* Interface construída com foco em leitura rápida (`< 3 segundos`), contraste elevado (WCAG AA/AAA), botão de **Leitura em Voz Alta (`window.speechSynthesis` em `pt-BR`)** para moradores com baixa escolaridade ou deficiência visual, e cache offline via Service Worker + `localStorage` para manter o último alerta acessível mesmo se a internet cair durante o temporal.
