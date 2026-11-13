import json
import os
from typing import Dict, Optional
import httpx


def classificar_nivel_risco(chuva_mm: float) -> str:
    """
    Regra determinística auditável de segurança civil:
    A IA NUNCA decide sozinha o nível de risco para evitar alucinações
    em cenários de risco de vida nas encostas e margens de rios/mangues.
    """
    if chuva_mm >= 15.0:
        return "CRÍTICO"
    elif chuva_mm >= 5.0:
        return "MODERADO"
    return "BAIXO"


def traduzir_alerta_deterministico(
    territorio: str,
    ecossistema: str,
    chuva_mm: float,
    ponto_apoio: str,
    fator_vulnerabilidade: Optional[str] = None,
) -> Dict[str, str]:
    """
    Camada determinística validada com linguagem acessível e foco territorial
    inspirada no Manifesto Caranguejos com Cérebro (proteção de encostas, rios e mangues).
    """
    nivel_risco = classificar_nivel_risco(chuva_mm)

    if nivel_risco == "CRÍTICO":
        return {
            "nivel_risco": "CRÍTICO",
            "alerta_humanizado": (
                f"Atenção urgente em {territorio}! Está chovendo muito forte agora "
                f"({chuva_mm:.1f} mm/h). Há risco imediato de deslizamento de barreira "
                f"ou alagamento rápido na área de {ecossistema}."
            ),
            "acao_segura": (
                f"Saia de áreas de encosta ou beira de canal imediatamente, avise seus "
                f"vizinhos e procure abrigo seguro em: {ponto_apoio}. Em emergência, ligue 199 (Defesa Civil)."
            ),
            "cuidado_ambiental": (
                "Não tente desentupir bueiros ou barreiras durante a enxurrada e mantenha "
                "distância das margens dos rios e mangues."
            ),
            "fonte_ia": "deterministico_validado",
        }
    elif nivel_risco == "MODERADO":
        return {
            "nivel_risco": "MODERADO",
            "alerta_humanizado": (
                f"Fique ligado, morador de {territorio}: chuva moderada ({chuva_mm:.1f} mm/h) "
                f"atingindo a região de {ecossistema}. O solo e os canais já começam a acumular água."
            ),
            "acao_segura": (
                f"Separe documentos e remédios em saco plástico, carregue o celular e deixe a "
                f"rota pronta até: {ponto_apoio}. Observe rachaduras em muros ou subida rápida do canal."
            ),
            "cuidado_ambiental": (
                "Nunca descarte lixo ou entulho nas encostas e canais; o lixo bloqueia o "
                "escoamento natural para o mangue e agrava os alagamentos na comunidade."
            ),
            "fonte_ia": "deterministico_validado",
        }
    else:
        return {
            "nivel_risco": "BAIXO",
            "alerta_humanizado": (
                f"Tudo tranquilo em {territorio} no momento ({chuva_mm:.1f} mm/h). "
                f"Sem risco imediato de chuva forte na região de {ecossistema}."
            ),
            "acao_segura": (
                f"Acompanhe as atualizações pelo aplicativo e conheça o ponto de apoio da "
                f"sua comunidade: {ponto_apoio}."
            ),
            "cuidado_ambiental": (
                f"Proteger a área de {ecossistema} hoje evita tragédias amanhã: descarte resíduos "
                f"apenas nos pontos de coleta e ajude a preservar as árvores e manguezais do Recife."
            ),
            "fonte_ia": "deterministico_validado",
        }


async def traduzir_alerta_com_ia(
    territorio: str,
    ecossistema: str,
    chuva_mm: float,
    ponto_apoio: str,
    fator_vulnerabilidade: Optional[str] = None,
) -> Dict[str, str]:
    """
    Converte dados meteorológicos técnicos em linguagem simples, acolhedora e
    contextualizada para o território de Recife.
    Se GEMINI_API_KEY estiver configurada, utiliza o Gemini 2.5 Flash com limite
    estrito de tempo (< 2.5s) e guardrail determinístico de nível de risco.
    Caso contrário, retorna imediatamente o fallback determinístico validado.
    """
    base_fallback = traduzir_alerta_deterministico(
        territorio=territorio,
        ecossistema=ecossistema,
        chuva_mm=chuva_mm,
        ponto_apoio=ponto_apoio,
        fator_vulnerabilidade=fator_vulnerabilidade,
    )

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return base_fallback

    nivel_risco = base_fallback["nivel_risco"]
    prompt = (
        "Você é o T.A.D.C. (Tradutor de Alertas da Defesa Civil do Recife), inspirado no "
        "movimento Manguebeat (Caranguejos com Cérebro). Traduza os dados técnicos abaixo "
        "para um morador de periferia/encosta/beira de rio do Recife em linguagem direta, "
        "acolhedora, sem jargões técnicos e que possa ser lida em menos de 3 segundos.\n\n"
        f"- Comunidade/Bairro: {territorio}\n"
        f"- Ecossistema local: {ecossistema}\n"
        f"- Vulnerabilidade local: {fator_vulnerabilidade or 'Área vulnerável a chuvas'}\n"
        f"- Precipitação atual: {chuva_mm:.1f} mm/h\n"
        f"- Nível de risco (FIXO E OBRIGATÓRIO): {nivel_risco}\n"
        f"- Ponto de apoio oficial: {ponto_apoio}\n\n"
        "Responda APENAS com um JSON válido contendo exatamente as chaves:\n"
        '{"alerta_humanizado": "...", "acao_segura": "...", "cuidado_ambiental": "..."}'
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=2.5) as client:
            resp = await client.post(url, json=body)
            resp.raise_for_status()
            data = resp.json()
            text_content = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            parsed = json.loads(text_content)
            if all(k in parsed for k in ("alerta_humanizado", "acao_segura", "cuidado_ambiental")):
                return {
                    "nivel_risco": nivel_risco,  # Guardrail determinístico imutável
                    "alerta_humanizado": str(parsed["alerta_humanizado"]),
                    "acao_segura": str(parsed["acao_segura"]),
                    "cuidado_ambiental": str(parsed["cuidado_ambiental"]),
                    "fonte_ia": "gemini_ia",
                }
    except Exception:
        pass

    return base_fallback

