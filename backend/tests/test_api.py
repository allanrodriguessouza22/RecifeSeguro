import os
import sys
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

# Garante que o pacote backend possa ser importado independentemente do diretório atual
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app.main import app  # noqa: E402
from backend.app.services.ai_translator import traduzir_alerta_deterministico  # noqa: E402

client = TestClient(app)

MOCK_WEATHER_RESPONSE = {
    "precipitation": 1.2,
    "temperature_2m": 27.5,
    "raw": {"current": {"precipitation": 1.2, "temperature_2m": 27.5}},
    "fallback": False,
}


def test_health_check_retorna_200_online():
    """Teste 1: Health check da API (/api/v1/health retornando 200 OK)."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["projeto"] == "Recife Seguro - PWA"


def test_listar_territorios_monitorados():
    """Verifica se a listagem de territórios de Recife retorna os bairros cadastrados."""
    response = client.get("/api/v1/territorios")
    assert response.status_code == 200
    territorios = response.json()
    assert isinstance(territorios, list)
    assert len(territorios) >= 3
    nomes = [t["nome_local"] for t in territorios]
    assert any("Morro da Conceição" in nome for nome in nomes)
    assert any("Joana Bezerra" in nome for nome in nomes)
    assert any("Ibura" in nome for nome in nomes)


@patch(
    "backend.app.main.buscar_clima_open_meteo",
    new_callable=AsyncMock,
    return_value=MOCK_WEATHER_RESPONSE,
)
def test_alerta_risco_baixo(mock_weather):
    """Teste 2: Validação de risco BAIXO (chuva < 5.0 mm/h)."""
    response = client.get("/api/v1/alerta/1?simular_chuva=1.5")
    assert response.status_code == 200
    data = response.json()
    assert data["nivel_risco"] == "BAIXO"
    assert data["precipitacao_mm"] == 1.5
    assert "Morro da Conceição" in data["territorio"]
    assert "Escola Municipal Prof. Solano Trindade" in data["ponto_apoio"]


@patch(
    "backend.app.main.buscar_clima_open_meteo",
    new_callable=AsyncMock,
    return_value=MOCK_WEATHER_RESPONSE,
)
def test_alerta_risco_moderado(mock_weather):
    """Teste 3: Validação de risco MODERADO (5.0 <= chuva < 15.0 mm/h)."""
    response = client.get("/api/v1/alerta/2?simular_chuva=8.5")
    assert response.status_code == 200
    data = response.json()
    assert data["nivel_risco"] == "MODERADO"
    assert data["precipitacao_mm"] == 8.5
    assert "Joana Bezerra" in data["territorio"]
    assert "mangue" in data["cuidado_ambiental"].lower()


@patch(
    "backend.app.main.buscar_clima_open_meteo",
    new_callable=AsyncMock,
    return_value=MOCK_WEATHER_RESPONSE,
)
def test_alerta_risco_critico(mock_weather):
    """Teste 4: Validação de classificação e tradução de risco CRÍTICO (chuva >= 15.0 mm/h)."""
    response = client.get("/api/v1/alerta/3?simular_chuva=22.5")
    assert response.status_code == 200
    data = response.json()
    assert data["nivel_risco"] == "CRÍTICO"
    assert data["precipitacao_mm"] == 22.5
    assert "Ibura" in data["territorio"]
    assert "urgente" in data["alerta_humanizado"].lower()
    assert "Escola Municipal Sociólogo Gilberto Freyre" in data["acao_segura"]


@patch(
    "backend.app.main.buscar_clima_open_meteo",
    new_callable=AsyncMock,
    return_value=MOCK_WEATHER_RESPONSE,
)
def test_endpoint_simular_crise_pitch(mock_weather):
    """Teste 5: Endpoint POST /api/v1/simular-crise/{id} para demonstração ao vivo no Pitch."""
    response = client.post("/api/v1/simular-crise/1", json={"precipitacao_mm": 45.0})
    assert response.status_code == 200
    data = response.json()
    assert data["nivel_risco"] == "CRÍTICO"
    assert data["precipitacao_mm"] == 45.0


def test_territorio_inexistente_retorna_404():
    """Teste 6: Tratamento de erro para território inexistente (/api/v1/alerta/999 -> 404)."""
    response = client.get("/api/v1/alerta/999")
    assert response.status_code == 404
    assert "Território não encontrado" in response.json()["detail"]


def test_regra_deterministica_tradutor_ia():
    """Teste 7: Garante que os limiares determinísticos de segurança nunca falhem."""
    res_baixo = traduzir_alerta_deterministico("Morro da Conceição", "Encosta/Morro", 0.0, "Escola A")
    res_mod = traduzir_alerta_deterministico("Joana Bezerra", "Manguezal", 5.0, "Escola B")
    res_crit = traduzir_alerta_deterministico("Ibura", "Encosta/Morro", 15.0, "Escola C")

    assert res_baixo["nivel_risco"] == "BAIXO"
    assert res_mod["nivel_risco"] == "MODERADO"
    assert res_crit["nivel_risco"] == "CRÍTICO"

