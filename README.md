# 🏆 Recife Seguro (T.A.D.C.) - Hackathon APONTI Academy 2026

> **Desafio:** Antena na Lama (REC'n'Play 2026)  
> **Caminho escolhido:** Alertar e proteger (durante a crise)  
> **Alinhamento ODS:** ODS 13 (Ação contra a Mudança Global do Clima), ODS 11 (Cidades e Comunidades Sustentáveis) e ODS 6 (Água Potável e Saneamento)

## 📖 Sobre o Projeto
Eventos climáticos extremos — chuvas intensas, alagamentos, deslizamentos de barreiras e marés altas conjugadas — atingem severamente a Região Metropolitana do Recife. Embora existam dados meteorológicos oficiais (APAC, Cemaden e Defesa Civil), os boletins frequentemente chegam em **linguagem técnica complexa** (ex.: *"precipitação acumulada de 30mm/h com convergência de umidade"*) e dependem de conexões estáveis, dificultando a tomada de decisão rápida por quem vive nas encostas (*Morro da Conceição*, *UR-02 Ibura*) e nas margens de rios, canais e manguezais (*Ilha Joana Bezerra / Coque*, *Córrego do Jenipapo*, *Ilha de Deus*, *Vila dos Milagres*).

O **Recife Seguro — T.A.D.C. (Tradutor de Alertas da Defesa Civil)** resolve esse problema atuando como um tradutor comunitário de crise em formato **PWA (Progressive Web App)** leve, instalável no celular e com cache offline automático. Em **menos de 3 segundos**, a plataforma combina um **Mapa Interativo em Tempo Real (Leaflet + CARTO/OpenStreetMap)** com dados meteorológicos da **Open-Meteo** e **IA Generativa (Google Gemini 2.5 Flash)** sob guardrails determinísticos de segurança para transformar termos técnicos frios em um **Semáforo Visual de Risco** (`BAIXO`, `MODERADO`, `CRÍTICO`), diferenciando microterritórios do mesmo bairro (ex.: *UR-02 Ibura — Encosta* vs. *Vila dos Milagres — Canal*) com rotas de fuga hiperlocais e a **Escola Municipal / Ponto de Apoio oficial** mais próximo.

Para garantir inclusão, acessibilidade universal (WCAG AA/AAA) e resiliência total quando as torres de internet caem na tempestade, o aplicativo conta com **Malha de Emergência Offline P2P (transmissão celular-a-celular via QR Code de alta densidade, SMS 2G e Bluetooth)**, **Leitura em Voz Alta nativa em Português (`pt-BR`)**, **compartilhamento em 1 clique no WhatsApp**, discagem rápida para a **Defesa Civil (199)** e a seção educativa **Cuidando do Nosso Território** (inspirada no manifesto *Caranguejos com Cérebro*), conectando a prevenção de desastres à preservação dos manguezais, rios e encostas do Recife.

### 🔍 Transparência de Dados (Tempo Real vs. Dados Fixos / Mockados)
Para total transparência técnica com a banca avaliadora e resiliência em campo, a aplicação opera de forma híbrida:
*   **Dados em Tempo Real (Produção):** A precipitação (`mm/h`) e a temperatura (`°C`) são consultadas ao vivo na API **Open-Meteo** pelas coordenadas geográficas exatas de cada microterritório, a renderização cartográfica é carregada em tempo real via **Leaflet + CARTO/OpenStreetMap**, e os textos humanizados (`alerta_humanizado`, `acao_segura`, `cuidado_ambiental`) são gerados dinamicamente pelo **Google Gemini 2.5 Flash** (`fonte_ia: "gemini_ia"`).
*   **Catálogo Territorial Curado (Seed / Dados Estáticos):** Os **6 microterritórios vulneráveis**, suas topografias de risco (*Encosta/Morro*, *Manguezal / Margem de Rio*, *Córrego*, *Estuário*, *Margem de Canal / Várzea*), rotas de fuga seguras e as **Escolas/Creches Municipais (Pontos de Apoio)** correspondentes são dados fixos pré-cadastrados (`SEED_TERRITORIOS` no back-end e `TERRITORIOS_PADRAO` no front-end), baseados nos mapeamentos abertos da Prefeitura do Recife (`dados.recife.pe.gov.br`).
*   **Modo Demonstração / Pitch e Fallback Offline Mockado:** Como o clima real do Recife no momento da apresentação pode estar sem chuva (`0.0 mm/h`), a barra inferior do app possui botões de simulação (`8.5 mm/h`, `22.5 mm/h`, `Crise Extrema 45 mm/h` e `⚡ Malha P2P`) que injetam volumes de chuva controlados (`?simular_chuva=X`) para demonstrar a reação do mapa, da IA e do semáforo ao vivo. Além disso, caso o usuário execute apenas o front-end ou fique sem internet durante uma tempestade, o `AlertaService` aciona automaticamente o cache no `localStorage` ou respostas determinísticas locais pré-configuradas (`fonte_ia: "cache_offline_seguro"`), garantindo que o morador nunca veja uma tela de erro durante uma emergência.

## 👥 Equipe
*   **Desenvolvedores:**
    *   Allan Rodrigues - [Full Stack / IA / Arquitetura & Deploy]
    *   Artur Leone - [DevOps / CI-CD / Qualidade & Back-end]
    *   [Nome 3] - [Trilha: ex: Front-end / UX]
    *   [Nome 4] - [Trilha: ex: Dados / Mobile / Testes]
*   **Validador(a) (Movimento Pró-Criança):**
    *   [Nome do Validador(a)]

## 🚀 Tecnologias Utilizadas
*   **Front-end:** Angular 18+ (Standalone Components), TypeScript, Tailwind CSS, Leaflet (Mapa Interativo CARTO/OSM), QRCode (Malha P2P Offline), Angular Service Worker (`@angular/pwa`) e Web Speech API (`speechSynthesis` nativo `pt-BR`)
*   **Back-end:** Python 3.12 com FastAPI, Pydantic v2, SQLAlchemy 2.0 e HTTPX (integração assíncrona com Open-Meteo API e Google Gemini 2.5 Flash API)
*   **Banco de Dados:** PostgreSQL (Neon / Vercel Postgres via `DATABASE_URL`) com fallback resiliente para SQLite local
*   **Deploy:** Vercel (Deploy unificado: Front-end PWA estático + Back-end Python Serverless Functions em `/api/index.py`) e CI/CD no GitHub Actions (Pytest, Ruff, Build Angular e CodeQL SAST)
*   **Testes:** Pytest + FastAPI `TestClient` (9 testes automatizados de integração e unidade, incluindo validação hiperlocal de microterritórios do mesmo bairro)

## 🤖 Uso Ético de IA (Obrigatório pelo Edital)
*Conforme o item 9 do edital, registramos onde a IA foi usada — tanto no produto em execução quanto no desenvolvimento — e como foi auditada e corrigida.*

*   **Onde a IA foi usada:**
    1. **No Produto (Runtime):** Utilizamos a API do **Google Gemini 2.5 Flash** (`backend/app/services/ai_translator.py`) para traduzir métricas meteorológicas brutas (`mm/h`, `°C`, coordenadas e topografia do microterritório) em alertas comunitários empáticos, diferenciando orientações para moradores de **Encosta/Morro** (foco em deslizamento de barreiras e lonas) e de **Canal / Manguezal / Margem de Rio** (foco em cheia de canais, maré alta, desligamento de disjuntor e contaminação hídrica).
    2. **No Desenvolvimento:** Apoio na estruturação inicial dos componentes Standalone do Angular, integração do mapa Leaflet e QR Code P2P, configuração de pipelines CI/CD, geração de casos de teste automatizados em `pytest` e revisão de acessibilidade e responsividade da interface.
*   **O que foi corrigido/validado:**
    1. **Guardrail Determinístico contra Alucinação de Risco (Segurança de Vida):** Identificamos que um LLM jamais deve decidir sozinho se uma chuva de `20 mm/h` em um morro é risco baixo ou crítico, nem inventar nomes de abrigos. Corrigimos isso implementando a função determinística auditável `classificar_nivel_risco()` no código (`BAIXO < 5 mm/h`, `MODERADO 5–14.9 mm/h`, `CRÍTICO >= 15 mm/h`) e injetando obrigatoriamente a Escola/Creche Municipal oficial e a rota de fuga do microterritório.
    2. **Contingência contra Latência ou Queda da API de IA:** Aplicamos timeout estrito, cache em memória por faixa climática e fallback determinístico instantâneo (`< 50ms`) caso a chave `GEMINI_API_KEY` falhe ou oscile durante um temporal.
    3. **Ajuste de Design, Contraste e Layout Responsivo:** Corrigimos quebras de texto em nomes longos de escolas/comunidades, adicionamos espaçamento estrutural nos host elements do Angular (`:host { display: block }`) e elevamos o contraste visual das cores do semáforo para os padrões WCAG AA/AAA.
*   **Ferramentas usadas:** Google Gemini 2.5 Flash API, Antigravity (Google DeepMind) e GitHub Actions / CodeQL.

## 🛠️ Como rodar o projeto localmente
### Pré-requisitos
*   Node.js 20+ e npm
*   Python 3.11 ou 3.12+
*   PostgreSQL *(opcional localmente — o projeto possui fallback automático para SQLite se `DATABASE_URL` não for informada)*

### Back-end
```bash
# A partir da raiz do projeto (ou dentro de backend/)
# 1. Instalar dependências
pip install -r backend/requirements.txt

# 2. (Opcional) Configurar a chave da IA Gemini para tradução generativa ao vivo
# No PowerShell: $env:GEMINI_API_KEY="SUA_CHAVE_AQUI"
# No Linux/macOS: export GEMINI_API_KEY="SUA_CHAVE_AQUI"

# 3. Rodar servidor FastAPI na porta 8000
python -m uvicorn backend.app.main:app --reload --port 8000
```
*(A documentação interativa Swagger UI ficará disponível em `http://127.0.0.1:8000/docs`)*

### Front-end
```bash
cd frontend
# Instalar dependências
npm install
# Rodar projeto (com proxy configurado para http://127.0.0.1:8000)
npm start
```
*(Acesse no navegador em `http://localhost:4200`)*

## 🌐 Deploy Público
*   **Link do Front-end (PWA):** https://recifeseguro-five.vercel.app
*   **Link da API (Back-end Health Check):** https://recifeseguro-five.vercel.app/api/v1/health
*   **Link da API (Lista de Territórios):** https://recifeseguro-five.vercel.app/api/v1/territorios

## 🧪 Testes Automatizados
Temos **9 testes automatizados** passando no CI (GitHub Actions — workflow `.github/workflows/ci.yml`), cobrindo health check, listagem de territórios, regras determinísticas de classificação de risco (`BAIXO`, `MODERADO`, `CRÍTICO`), diferenciação hiperlocal entre dois microterritórios do mesmo bairro (*Ibura Encosta vs. Ibura Canal*), simulação de crise para o Pitch e validação de território inexistente (`404`). Para rodar localmente:

```bash
python -m pytest backend/tests/test_api.py -v
```
