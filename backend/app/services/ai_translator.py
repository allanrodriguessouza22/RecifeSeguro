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
    bairro: Optional[str] = None,
    microterritorio: Optional[str] = None,
    topografia_risco: Optional[str] = None,
    rota_fuga_segura: Optional[str] = None,
) -> Dict[str, str]:
    """
    Camada determinística validada com linguagem acessível e foco hiperlocal
    inspirada no Manifesto Caranguejos com Cérebro (proteção de encostas, rios e mangues).
    Diferencia microterritórios do mesmo bairro conforme topografia (encosta vs canal/várzea).
    """
    nivel_risco = classificar_nivel_risco(chuva_mm)
    nome_exibicao = microterritorio or territorio
    rotulo_topografia = topografia_risco or ecossistema
    rota_sugerida = f" Rota de fuga segura: {rota_fuga_segura}." if rota_fuga_segura else ""

    eh_encosta = any(k in rotulo_topografia.lower() for k in ("encosta", "morro", "barreira", "talude"))
    eh_canal = any(k in rotulo_topografia.lower() for k in ("canal", "rio", "córrego", "fundo de vale", "várzea"))
    eh_mangue = any(k in rotulo_topografia.lower() for k in ("mangue", "estuário", "palafita", "maré"))

    if nivel_risco == "CRÍTICO":
        if eh_encosta:
            alerta_texto = (
                f"Atenção urgente em {nome_exibicao}! Chuva muito forte ({chuva_mm:.1f} mm/h). "
                f"Solo saturado e risco extremo de deslizamento de barreira. Desocupe cômodos próximos ao morro!"
            )
            acao_texto = (
                f"Saia da encosta imediatamente, avise seus vizinhos e procure o ponto de apoio: {ponto_apoio}.{rota_sugerida} "
                f"Em emergência, ligue 199 (Defesa Civil)."
            )
        elif eh_canal:
            alerta_texto = (
                f"Alerta máximo em {nome_exibicao}! Chuva intensa ({chuva_mm:.1f} mm/h). "
                f"Risco iminente de transbordamento do canal e alagamento severo de vias."
            )
            acao_texto = (
                f"Desligue o disjuntor geral de energia, não enfrente correntezas e siga para terreno alto em: {ponto_apoio}.{rota_sugerida} "
                f"Em emergência, ligue 199 (Defesa Civil)."
            )
        elif eh_mangue:
            alerta_texto = (
                f"Atenção urgente na comunidade de {nome_exibicao}! Chuva forte ({chuva_mm:.1f} mm/h) conjugada com maré. "
                f"Risco de invasão das águas sobre passarelas e pontes."
            )
            acao_texto = (
                f"Evacue as palafitas e áreas baixas imediatamente e abrigue-se em: {ponto_apoio}.{rota_sugerida} "
                f"Em emergência, ligue 199."
            )
        else:
            alerta_texto = (
                f"Atenção urgente em {nome_exibicao}! Está chovendo muito forte agora ({chuva_mm:.1f} mm/h). "
                f"Há risco imediato de deslizamento ou alagamento rápido na área de {rotulo_topografia}."
            )
            acao_texto = (
                f"Saia de áreas vulneráveis imediatamente, avise seus vizinhos e procure abrigo seguro em: {ponto_apoio}.{rota_sugerida} "
                f"Em emergência, ligue 199 (Defesa Civil)."
            )

        return {
            "nivel_risco": "CRÍTICO",
            "alerta_humanizado": alerta_texto,
            "acao_segura": acao_texto,
            "cuidado_ambiental": (
                "Não tente desentupir bueiros ou barreiras durante a enxurrada e mantenha "
                "distância das margens dos rios e canais."
            ),
            "fonte_ia": "deterministico_validado",
        }
    elif nivel_risco == "MODERADO":
        if eh_encosta:
            alerta_texto = (
                f"Fique ligado em {nome_exibicao}: chuva moderada ({chuva_mm:.1f} mm/h) infiltrando no morro. "
                f"O solo da encosta começa a pesar e amolecer."
            )
            acao_texto = (
                f"Observe rachaduras no chão ou muros e árvores inclinadas. Tenha rota pronta para: {ponto_apoio}.{rota_sugerida}"
            )
        elif eh_canal or eh_mangue:
            alerta_texto = (
                f"Atenção em {nome_exibicao}: chuva moderada ({chuva_mm:.1f} mm/h) com canais acumulando água rapidamente. "
                f"Risco de poças profundas e refluxo de bueiros."
            )
            acao_texto = (
                f"Eleve móveis e eletrodomésticos, guarde documentos em sacos plásticos e acompanhe o nível da água. Abrigo: {ponto_apoio}."
            )
        else:
            alerta_texto = (
                f"Fique ligado, morador de {nome_exibicao}: chuva moderada ({chuva_mm:.1f} mm/h) "
                f"atingindo a região de {rotulo_topografia}. O solo e canais começam a acumular água."
            )
            acao_texto = (
                f"Separe documentos e remédios em saco plástico, carregue o celular e deixe a "
                f"rota pronta até: {ponto_apoio}.{rota_sugerida}"
            )

        return {
            "nivel_risco": "MODERADO",
            "alerta_humanizado": alerta_texto,
            "acao_segura": acao_texto,
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
                f"Tudo tranquilo em {nome_exibicao} no momento ({chuva_mm:.1f} mm/h). "
                f"Sem risco imediato de chuva forte no setor de {rotulo_topografia}."
            ),
            "acao_segura": (
                f"Acompanhe as atualizações pelo aplicativo e conheça a rota até seu ponto de apoio: {ponto_apoio}.{rota_sugerida}"
            ),
            "cuidado_ambiental": (
                f"Proteger a área de {rotulo_topografia} hoje evita tragédias amanhã: descarte resíduos "
                f"apenas nos pontos de coleta e ajude a preservar os morros e canais do Recife."
            ),
            "fonte_ia": "deterministico_validado",
        }


async def traduzir_alerta_com_ia(
    territorio: str,
    ecossistema: str,
    chuva_mm: float,
    ponto_apoio: str,
    fator_vulnerabilidade: Optional[str] = None,
    bairro: Optional[str] = None,
    microterritorio: Optional[str] = None,
    topografia_risco: Optional[str] = None,
    rota_fuga_segura: Optional[str] = None,
) -> Dict[str, str]:
    """
    Converte dados meteorológicos técnicos em linguagem simples, acolhedora e
    hiperlocalizada para a microárea de Recife.
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
        bairro=bairro,
        microterritorio=microterritorio,
        topografia_risco=topografia_risco,
        rota_fuga_segura=rota_fuga_segura,
    )

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return base_fallback

    nivel_risco = base_fallback["nivel_risco"]
    prompt = (
        "Você é o T.A.D.C. (Tradutor de Alertas da Defesa Civil do Recife), inspirado no "
        "movimento Manguebeat (Caranguejos com Cérebro). Traduza os dados técnicos abaixo "
        "para um morador desta microárea do Recife em linguagem direta, acolhedora, "
        "sem jargões técnicos e que possa ser lida em menos de 3 segundos.\n\n"
        f"- Bairro: {bairro or territorio}\n"
        f"- Microterritório/Rua: {microterritorio or territorio}\n"
        f"- Topografia de Risco: {topografia_risco or ecossistema}\n"
        f"- Vulnerabilidade local: {fator_vulnerabilidade or 'Área vulnerável a eventos climáticos'}\n"
        f"- Rota de fuga: {rota_fuga_segura or 'Ponto de apoio municipal'}\n"
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

