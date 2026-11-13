from typing import Any, Dict
import httpx


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


async def buscar_clima_open_meteo(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Consulta a API aberta Open-Meteo em tempo real para obter precipitação (mm)
    e temperatura (°C) nas coordenadas exatas do território monitorado em Recife.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,precipitation",
        "timezone": "America/Recife",
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.get(OPEN_METEO_URL, params=params)
            response.raise_for_status()
            payload = response.json()
            current = payload.get("current", {})
            return {
                "precipitation": float(current.get("precipitation", 0.0)),
                "temperature_2m": float(current.get("temperature_2m", 28.0)),
                "raw": payload,
                "fallback": False,
            }
    except Exception as exc:
        # Fallback resiliente caso a rede externa oscile durante tempestades
        return {
            "precipitation": 0.0,
            "temperature_2m": 28.0,
            "raw": {"status": "offline_fallback", "detalhe": str(exc)},
            "fallback": True,
        }

