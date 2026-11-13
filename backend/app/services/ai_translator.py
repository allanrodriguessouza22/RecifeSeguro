import json
import os
from typing import Dict, Optional, Tuple
import httpx

_CACHE_TRADUCOES_IA: Dict[Tuple[str, float], Dict[str, str]] = {}


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
    Camada determinística validada com linguagem acessível e hiperlocalizada por ecossistema
    inspirada no Manifesto Caranguejos com Cérebro (proteção de encostas, córregos, rios e mangues).
    """
    nivel_risco = classificar_nivel_risco(chuva_mm)
    eco_lower = (ecossistema or "").lower()
    eh_mangue_ou_rio = any(p in eco_lower for p in ("mangue", "estuário", "estuario", "rio"))
    eh_corrego = "córrego" in eco_lower or "corrego" in eco_lower

    if nivel_risco == "CRÍTICO":
        if eh_mangue_ou_rio:
            return {
                "nivel_risco": "CRÍTICO",
                "alerta_humanizado": (
                    f"Atenção urgente em {territorio}! Está chovendo muito forte agora "
                    f"({chuva_mm:.1f} mm/h). Há risco imediato de alagamento rápido e "
                    f"transbordamento de canais e margens de rio com a maré na área de {ecossistema}."
                ),
                "acao_segura": (
                    f"Saia de áreas baixas e beira de rio ou canal imediatamente, desligue a energia "
                    f"elétrica, avise seus vizinhos e procure abrigo seguro em: {ponto_apoio}. "
                    f"Em emergência, ligue 199 (Defesa Civil)."
                ),
                "cuidado_ambiental": (
                    "Evite contato com a água de alagamento dos canais e mantenha distância das "
                    "margens dos rios e mangues durante a cheia."
                ),
                "fonte_ia": "deterministico_validado",
            }
        if eh_corrego:
            return {
                "nivel_risco": "CRÍTICO",
                "alerta_humanizado": (
                    f"Atenção urgente em {territorio}! Está chovendo muito forte agora "
                    f"({chuva_mm:.1f} mm/h). Há risco imediato de transbordamento súbito do córrego "
                    f"e deslizamento nas encostas próximas ({ecossistema})."
                ),
                "acao_segura": (
                    f"Afaste-se imediatamente da beira do córrego e das barreiras, avise seus "
                    f"vizinhos e procure abrigo seguro em: {ponto_apoio}. Em emergência, ligue 199 (Defesa Civil)."
                ),
                "cuidado_ambiental": (
                    "Não tente atravessar enxurradas nem desentupir galerias do córrego durante a tempestade."
                ),
                "fonte_ia": "deterministico_validado",
            }
        return {
            "nivel_risco": "CRÍTICO",
            "alerta_humanizado": (
                f"Atenção urgente em {territorio}! Está chovendo muito forte agora "
                f"({chuva_mm:.1f} mm/h). Há risco imediato de deslizamento de barreira "
                f"e enxurrada forte na área de {ecossistema}."
            ),
            "acao_segura": (
                f"Saia de áreas de encosta, pé de barreira ou muros inclinados imediatamente, avise seus "
                f"vizinhos e procure abrigo seguro em: {ponto_apoio}. Em emergência, ligue 199 (Defesa Civil)."
            ),
            "cuidado_ambiental": (
                "Não suba em barreiras durante a enxurrada, mantenha as lonas de proteção "
                "e nunca jogue lixo ou escave o talude do morro."
            ),
            "fonte_ia": "deterministico_validado",
        }

    elif nivel_risco == "MODERADO":
        if eh_mangue_ou_rio:
            return {
                "nivel_risco": "MODERADO",
                "alerta_humanizado": (
                    f"Fique ligado, morador de {territorio}: chuva moderada ({chuva_mm:.1f} mm/h) "
                    f"atingindo a região de {ecossistema}. Os canais e margens do rio já começam a subir."
                ),
                "acao_segura": (
                    f"Eleve móveis e documentos em saco plástico, carregue o celular e deixe a "
                    f"rota pronta até: {ponto_apoio}. Acompanhe o nível do canal e da maré."
                ),
                "cuidado_ambiental": (
                    "Nunca descarte lixo ou plástico nos canais; o lixo bloqueia o "
                    "escoamento natural para o mangue e agrava os alagamentos na comunidade."
                ),
                "fonte_ia": "deterministico_validado",
            }
        return {
            "nivel_risco": "MODERADO",
            "alerta_humanizado": (
                f"Fique ligado, morador de {territorio}: chuva moderada ({chuva_mm:.1f} mm/h) "
                f"atingindo a região de {ecossistema}. O solo da encosta já começa a encharcar."
            ),
            "acao_segura": (
                f"Separe documentos e remédios em saco plástico, carregue o celular e deixe a "
                f"rota pronta até: {ponto_apoio}. Observe rachaduras em muros, postes ou árvores inclinadas."
            ),
            "cuidado_ambiental": (
                "Nunca descarte lixo ou entulho nas encostas e canaletas; o lixo bloqueia a "
                "drenagem da ladeira, encharca a barreira e agrava o risco para o mangue e os canais."
            ),
            "fonte_ia": "deterministico_validado",
        }

    else:
        if eh_mangue_ou_rio:
            return {
                "nivel_risco": "BAIXO",
                "alerta_humanizado": (
                    f"Tudo tranquilo em {territorio} no momento ({chuva_mm:.1f} mm/h). "
                    f"Sem risco imediato de alagamento ou cheia na região de {ecossistema}."
                ),
                "acao_segura": (
                    f"Acompanhe as atualizações pelo aplicativo e conheça o ponto de apoio oficial da "
                    f"sua comunidade: {ponto_apoio}."
                ),
                "cuidado_ambiental": (
                    f"Proteger a área de {ecossistema} hoje evita enchentes amanhã: o manguezal "
                    f"funciona como esponja natural para amortecer as chuvas e a maré alta no Recife."
                ),
                "fonte_ia": "deterministico_validado",
            }
        return {
            "nivel_risco": "BAIXO",
            "alerta_humanizado": (
                f"Tudo tranquilo em {territorio} no momento ({chuva_mm:.1f} mm/h). "
                f"Sem risco imediato de chuva forte na região de {ecossistema}."
            ),
            "acao_segura": (
                f"Acompanhe as atualizações pelo aplicativo e conheça o ponto de apoio oficial da "
                f"sua comunidade: {ponto_apoio}."
            ),
            "cuidado_ambiental": (
                f"Proteger a área de {ecossistema} hoje evita tragédias amanhã: mantenha canaletas "
                f"limpas, preserve a vegetação nas encostas e descarte resíduos apenas na coleta."
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
    Se GEMINI_API_KEY estiver configurada, utiliza o Gemini 2.5 Flash com baixa latência
    (thinkingBudget=0) e guardrail determinístico de nível de risco e ponto de apoio.
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

    chave_cache = (territorio, round(chuva_mm, 1))
    if chave_cache in _CACHE_TRADUCOES_IA:
        return _CACHE_TRADUCOES_IA[chave_cache]

    nivel_risco = base_fallback["nivel_risco"]
    prompt = (
        "Você é o T.A.D.C. (Tradutor de Alertas da Defesa Civil do Recife), inspirado no "
        "movimento Manguebeat (Caranguejos com Cérebro). Traduza os dados técnicos abaixo "
        "para um morador de comunidade vulnerável do Recife em linguagem direta, empática, "
        "sem jargões meteorológicos difíceis e compreensível em menos de 3 segundos.\n\n"
        f"- Comunidade/Bairro: {territorio}\n"
        f"- Ecossistema local: {ecossistema}\n"
        f"- Vulnerabilidade específica do local: {fator_vulnerabilidade or 'Área vulnerável a chuvas'}\n"
        f"- Precipitação atual: {chuva_mm:.1f} mm/h\n"
        f"- Nível de risco (FIXO E OBRIGATÓRIO): {nivel_risco}\n"
        f"- Ponto de apoio oficial (OBRIGATÓRIO citar em acao_segura): {ponto_apoio}\n\n"
        "Regras obrigatórias de segurança (Guardrails):\n"
        f"1. Em alerta_humanizado, cite '{territorio}', o volume '{chuva_mm:.1f} mm/h' e diferencie claramente "
        "se o perigo local é deslizamento de barreira/encosta ou cheia de rio/canal/maré no manguezal. "
        "Se o risco for CRÍTICO, inclua a palavra 'urgente'.\n"
        f"2. Em acao_segura, dê uma instrução prática imediata adequada ao ecossistema ({ecossistema}) "
        f"e cite explicitamente o abrigo '{ponto_apoio}' e o telefone 199 da Defesa Civil.\n"
        f"3. Em cuidado_ambiental, dê uma dica curta conectando a proteção de {ecossistema} (encostas, córregos ou mangues) "
        "à prevenção de desastres na comunidade.\n\n"
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
        async with httpx.AsyncClient(timeout=6.5) as client:
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
                acao_segura = str(parsed["acao_segura"])
                if ponto_apoio not in acao_segura:
                    acao_segura = f"{acao_segura} Ponto de apoio oficial: {ponto_apoio}."
                resultado_ia = {
                    "nivel_risco": nivel_risco,  # Guardrail determinístico imutável
                    "alerta_humanizado": str(parsed["alerta_humanizado"]),
                    "acao_segura": acao_segura,
                    "cuidado_ambiental": str(parsed["cuidado_ambiental"]),
                    "fonte_ia": "gemini_ia",
                }
                _CACHE_TRADUCOES_IA[chave_cache] = resultado_ia
                return resultado_ia
    except Exception:
        pass

    return base_fallback
