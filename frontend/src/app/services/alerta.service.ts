import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { AlertaTerritorial, Territorio } from '../models/alerta.model';

const STORAGE_KEY_ULTIMO_ALERTA = 'recife_seguro_ultimo_alerta_v1';
const STORAGE_KEY_TERRITORIOS = 'recife_seguro_territorios_v1';

export const TERRITORIOS_PADRAO: Territorio[] = [
  {
    id: 1,
    nome_local: 'Morro da Conceição — Alto José do Pinho',
    bairro: 'Morro da Conceição',
    microterritorio: 'Alto José do Pinho / Encosta Norte',
    topografia_risco: 'Encosta Íngreme (Barreira R4)',
    tipo_ecossistema: 'Encosta/Morro',
    latitude: -8.0264,
    longitude: -34.9189,
    ponto_apoio_proximo: 'Escola Municipal Prof. Solano Trindade',
    fator_vulnerabilidade: 'Alta declividade (>35°), solo argiloso e risco iminente de desmoronamento de barreira',
    rota_fuga_segura: 'Desça pelo acesso asfaltado principal em direção à Escola Prof. Solano Trindade',
  },
  {
    id: 2,
    nome_local: 'Ilha Joana Bezerra — Comunidade do Coque',
    bairro: 'Ilha Joana Bezerra',
    microterritorio: 'Comunidade do Coque / Margem do Canal de Afogados',
    topografia_risco: 'Manguezal Urbano / Canal Estuarino',
    tipo_ecossistema: 'Manguezal / Margem de Rio',
    latitude: -8.0753,
    longitude: -34.8967,
    ponto_apoio_proximo: 'Escola Municipal Karla Patrícia',
    fator_vulnerabilidade: 'Influência direta de maré do Rio Capibaribe e refluxo do canal de drenagem',
    rota_fuga_segura: 'Siga pela Rua Imperial até a Escola Karla Patrícia, evitando pontes de madeira sobre o canal',
  },
  {
    id: 3,
    nome_local: 'UR-02 Ibura — Alto da Sucupira',
    bairro: 'Ibura',
    microterritorio: 'Alto da Sucupira / Rua Rio Brígida',
    topografia_risco: 'Encosta Íngreme (Barreira Viva)',
    tipo_ecossistema: 'Encosta/Morro',
    latitude: -8.1256,
    longitude: -34.9458,
    ponto_apoio_proximo: 'Escola Municipal Sociólogo Gilberto Freyre',
    fator_vulnerabilidade: 'Barreiras saturadas com alto risco de escorregamento sobre residências',
    rota_fuga_segura: 'Suba pela Rua Rio Pajeú até a Escola Sociólogo Gilberto Freyre. Afaste-se do talude',
  },
  {
    id: 4,
    nome_local: 'Córrego do Jenipapo — Calha do Rio Morno',
    bairro: 'Córrego do Jenipapo',
    microterritorio: 'Córrego do Jenipapo / Rua da Bica',
    topografia_risco: 'Fundo de Córrego / Vale Estreito',
    tipo_ecossistema: 'Encosta / Margem de Córrego',
    latitude: -8.0158,
    longitude: -34.9364,
    ponto_apoio_proximo: 'Escola Municipal Córrego do Jenipapo',
    fator_vulnerabilidade: 'Transbordamento violento da calha com forte correnteza e arrasto de materiais',
    rota_fuga_segura: 'Suba imediatamente pelas escadarias laterais em direção à Escola Córrego do Jenipapo',
  },
  {
    id: 5,
    nome_local: 'Ilha de Deus — Passarela dos Pescadores',
    bairro: 'Pina / Imbiribeira',
    microterritorio: 'Ilha de Deus / Passarela dos Pescadores',
    topografia_risco: 'Estuário de Maré / Área de Palafita',
    tipo_ecossistema: 'Estuário / Manguezal',
    latitude: -8.0975,
    longitude: -34.9092,
    ponto_apoio_proximo: 'Escola Municipal Paulo VI',
    fator_vulnerabilidade: 'Encontro dos rios Jordão e Tejipió com maré alta e submersão de passarelas',
    rota_fuga_segura: 'Evacue pelas passarelas elevadas em direção ao ponto de apoio na Escola Paulo VI',
  },
  {
    id: 6,
    nome_local: 'Baixa do Ibura — Vila dos Milagres',
    bairro: 'Ibura',
    microterritorio: 'Vila dos Milagres / Calha do Canal do Jordão',
    topografia_risco: 'Fundo de Vale / Baixada Inundável (Cota < 3m)',
    tipo_ecossistema: 'Margem de Canal / Várzea',
    latitude: -8.1215,
    longitude: -34.9380,
    ponto_apoio_proximo: 'Creche Municipal Casinha de Palha (Rua das Flores)',
    fator_vulnerabilidade: 'Assoreamento da calha, transbordamento súbito do canal e choque elétrico',
    rota_fuga_segura: 'Desligue a chave geral de luz e evacue pela Rua Nova Descoberta em direção à creche alta',
  },
];

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = '/api/v1';

  listarTerritorios(): Observable<Territorio[]> {
    return this.http.get<Territorio[]>(`${this.apiBase}/territorios`).pipe(
      tap((lista) => {
        try {
          localStorage.setItem(STORAGE_KEY_TERRITORIOS, JSON.stringify(lista));
        } catch {
          // Ignora erro de quota do storage
        }
      }),
      catchError(() => {
        try {
          const salvo = localStorage.getItem(STORAGE_KEY_TERRITORIOS);
          if (salvo) {
            return of(JSON.parse(salvo) as Territorio[]);
          }
        } catch {
          // Fallback para lista padrão
        }
        return of(TERRITORIOS_PADRAO);
      })
    );
  }

  obterAlerta(territorioId: number, simularChuva?: number | null): Observable<AlertaTerritorial> {
    let params = new HttpParams();
    if (simularChuva !== undefined && simularChuva !== null) {
      params = params.set('simular_chuva', simularChuva.toString());
    }

    return this.http
      .get<AlertaTerritorial>(`${this.apiBase}/alerta/${territorioId}`, { params })
      .pipe(
        tap((alerta) => this.salvarCacheOffline(territorioId, alerta)),
        catchError(() => of(this.obterFallbackOffline(territorioId, simularChuva)))
      );
  }

  simularCrisePitch(territorioId: number, precipitacaoMm = 45.0): Observable<AlertaTerritorial> {
    return this.http
      .post<AlertaTerritorial>(`${this.apiBase}/simular-crise/${territorioId}`, {
        precipitacao_mm: precipitacaoMm,
      })
      .pipe(
        tap((alerta) => this.salvarCacheOffline(territorioId, alerta)),
        catchError(() => of(this.obterFallbackOffline(territorioId, precipitacaoMm)))
      );
  }

  salvarCacheOffline(territorioId: number, alerta: AlertaTerritorial): void {
    try {
      const cacheAtual = this.lerMapaCache();
      cacheAtual[String(territorioId)] = alerta;
      localStorage.setItem(STORAGE_KEY_ULTIMO_ALERTA, JSON.stringify(cacheAtual));
    } catch {
      // Ignora erro de storage
    }
  }

  private lerMapaCache(): Record<string, AlertaTerritorial> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ULTIMO_ALERTA);
      return raw ? (JSON.parse(raw) as Record<string, AlertaTerritorial>) : {};
    } catch {
      return {};
    }
  }

  obterFallbackOffline(territorioId: number, simularChuva?: number | null): AlertaTerritorial {
    const mapa = this.lerMapaCache();
    if ((simularChuva === undefined || simularChuva === null) && mapa[String(territorioId)]) {
      return mapa[String(territorioId)];
    }

    const local =
      TERRITORIOS_PADRAO.find((t) => t.id === territorioId) ?? TERRITORIOS_PADRAO[0];
    const chuva = simularChuva ?? 0.0;
    const microNome = local.microterritorio || local.nome_local;
    const rotaTexto = local.rota_fuga_segura ? ` Rota recomendada: ${local.rota_fuga_segura}.` : '';

    if (chuva >= 15.0) {
      const ehEncosta = local.topografia_risco?.toLowerCase().includes('encosta') || local.tipo_ecossistema.toLowerCase().includes('encosta');
      const mensagem = ehEncosta
        ? `Atenção urgente em ${microNome}! Está chovendo muito forte agora (${chuva.toFixed(1)} mm/h). Solo saturado com alto risco de deslizamento de barreira. Desocupe quartos colados ao morro!`
        : `Alerta máximo em ${microNome}! Chuva intensa (${chuva.toFixed(1)} mm/h). Risco de inundação rápida do canal e vias submersas.`;

      const acao = ehEncosta
        ? `Saia da encosta imediatamente, avise seus vizinhos e procure abrigo seguro em: ${local.ponto_apoio_proximo}.${rotaTexto} Em emergência, ligue 199 (Defesa Civil).`
        : `Desligue a chave geral de luz, evite correntezas e vá para área alta em: ${local.ponto_apoio_proximo}.${rotaTexto} Em emergência, ligue 199.`;

      return {
        territorio_id: local.id,
        territorio: local.nome_local,
        bairro: local.bairro,
        microterritorio: local.microterritorio,
        topografia_risco: local.topografia_risco,
        rota_fuga_segura: local.rota_fuga_segura,
        ecossistema: local.tipo_ecossistema,
        precipitacao_mm: chuva,
        temperatura_c: 26.0,
        nivel_risco: 'CRÍTICO',
        alerta_humanizado: mensagem,
        acao_segura: acao,
        cuidado_ambiental:
          'Não tente desentupir bueiros ou barreiras durante a enxurrada e mantenha distância das margens dos rios e canais.',
        ponto_apoio: local.ponto_apoio_proximo,
        fator_vulnerabilidade: local.fator_vulnerabilidade,
        fonte_ia: 'cache_offline_seguro',
        atualizado_em: new Date().toISOString(),
      };
    }

    if (chuva >= 5.0) {
      return {
        territorio_id: local.id,
        territorio: local.nome_local,
        bairro: local.bairro,
        microterritorio: local.microterritorio,
        topografia_risco: local.topografia_risco,
        rota_fuga_segura: local.rota_fuga_segura,
        ecossistema: local.tipo_ecossistema,
        precipitacao_mm: chuva,
        temperatura_c: 27.0,
        nivel_risco: 'MODERADO',
        alerta_humanizado: `Fique ligado, morador de ${microNome}: chuva moderada (${chuva.toFixed(1)} mm/h) atingindo o setor de ${local.topografia_risco || local.tipo_ecossistema}. O solo já começa a acumular água.`,
        acao_segura: `Separe documentos em saco plástico, carregue o celular e deixe a rota pronta até: ${local.ponto_apoio_proximo}.${rotaTexto}`,
        cuidado_ambiental:
          'Nunca descarte lixo nas encostas ou canais; o lixo bloqueia o escoamento natural para o mangue e causa alagamentos.',
        ponto_apoio: local.ponto_apoio_proximo,
        fator_vulnerabilidade: local.fator_vulnerabilidade,
        fonte_ia: 'cache_offline_seguro',
        atualizado_em: new Date().toISOString(),
      };
    }

    return {
      territorio_id: local.id,
      territorio: local.nome_local,
      bairro: local.bairro,
      microterritorio: local.microterritorio,
      topografia_risco: local.topografia_risco,
      rota_fuga_segura: local.rota_fuga_segura,
      ecossistema: local.tipo_ecossistema,
      precipitacao_mm: chuva,
      temperatura_c: 28.5,
      nivel_risco: 'BAIXO',
      alerta_humanizado: `Tudo tranquilo em ${microNome} no momento (${chuva.toFixed(1)} mm/h). Sem risco imediato de chuva forte no setor de ${local.topografia_risco || local.tipo_ecossistema}.`,
      acao_segura: `Acompanhe as atualizações pelo aplicativo e conheça o ponto de apoio da sua comunidade: ${local.ponto_apoio_proximo}.${rotaTexto}`,
      cuidado_ambiental: `Proteger a área de ${local.tipo_ecossistema} hoje evita tragédias amanhã: descarte resíduos apenas nos pontos de coleta.`,
      ponto_apoio: local.ponto_apoio_proximo,
      fator_vulnerabilidade: local.fator_vulnerabilidade,
      fonte_ia: 'cache_offline_seguro',
      atualizado_em: new Date().toISOString(),
    };
  }

  /**
   * Serializa o alerta em formato JSON ultracompacto para transmissão P2P sem internet (QR Code / SMS / Bluetooth)
   */
  serializarParaP2P(alerta: AlertaTerritorial): string {
    const payload = {
      v: 1,
      id: alerta.territorio_id || 1,
      t: alerta.microterritorio || alerta.territorio,
      b: alerta.bairro || '',
      r: alerta.nivel_risco,
      c: alerta.precipitacao_mm,
      m: alerta.alerta_humanizado,
      s: alerta.acao_segura,
      f: alerta.rota_fuga_segura || '',
      a: alerta.ponto_apoio,
      ts: alerta.atualizado_em || new Date().toISOString(),
    };
    return JSON.stringify(payload);
  }

  /**
   * Desserializa um alerta recebido via QR Code ou P2P sem internet e o valida
   */
  desserializarDeP2P(codigoRaw: string): AlertaTerritorial | null {
    try {
      const data = JSON.parse(codigoRaw);
      if (!data || !data.t || !data.r || !data.a) {
        return null;
      }
      const alerta: AlertaTerritorial = {
        territorio_id: data.id || 1,
        territorio: data.t,
        bairro: data.b,
        microterritorio: data.t,
        nivel_risco: data.r,
        precipitacao_mm: Number(data.c) || 0,
        temperatura_c: 27.0,
        alerta_humanizado: data.m,
        acao_segura: data.s,
        rota_fuga_segura: data.f,
        cuidado_ambiental: 'Mantenha distância de canais e barreiras durante a chuva.',
        ponto_apoio: data.a,
        ecossistema: 'Território Comunitário',
        fonte_ia: 'malha_p2p_offline',
        atualizado_em: data.ts || new Date().toISOString(),
        recebido_via_p2p: true,
      };

      this.salvarCacheOffline(alerta.territorio_id || 1, alerta);
      return alerta;
    } catch {
      return null;
    }
  }
}

