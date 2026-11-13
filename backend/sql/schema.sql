-- Tabela de Territórios e Zonas de Risco em Recife (Baseada nos Dados Abertos da Prefeitura)
CREATE TABLE IF NOT EXISTS territorios_risco (
    id SERIAL PRIMARY KEY,
    nome_local VARCHAR(120) NOT NULL,          -- Ex: Morro da Conceição, Joana Bezerra, Ibura
    tipo_ecossistema VARCHAR(50) NOT NULL,     -- Ex: Encosta/Morro, Margem de Rio/Canal, Manguezal
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ponto_apoio_proximo VARCHAR(200) NOT NULL, -- Ex: Escola Municipal Alto da Bondade
    fator_vulnerabilidade TEXT
);

-- Tabela de Alertas Meteorológicos e Traduções Geradas por IA
CREATE TABLE IF NOT EXISTS alertas_gerados (
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

