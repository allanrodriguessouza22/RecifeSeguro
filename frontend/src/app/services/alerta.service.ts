import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { AlertaTerritorial, Territorio } from '../models/alerta.model';

const STORAGE_KEY_ULTIMO_ALERTA = 'recife_seguro_ultimo_alerta_v1';
const STORAGE_KEY_TERRITORIOS = 'recife_seguro_territorios_v1';

export const TERRITORIOS_PADRAO: Territorio[] = [
  {
    id: 1,
    nome_local: 'Morro da Conceição (Zona Norte)',
    tipo_ecossistema: 'Encosta/Morro',
    latitude: -8.0264,
    longitude: -34.9189,
    ponto_apoio_proximo: 'Escola Municipal Prof. Solano Trindade',
    fator_vulnerabilidade: 'Alta declividade e solo encharcado em chuvas intensas',
  },
  {
    id: 2,
    nome_local: 'Ilha Joana Bezerra / Coque (Centro)',
    tipo_ecossistema: 'Manguezal / Margem de Rio',
    latitude: -8.0753,
    longitude: -34.8967,
    ponto_apoio_proximo: 'Escola Municipal Karla Patrícia',
    fator_vulnerabilidade: 'Influência da maré do Rio Capibaribe e canais de drenagem',
  },
  {
    id: 3,
    nome_local: 'UR-02 Ibura (Zona Sul)',
    tipo_ecossistema: 'Encosta/Morro',
    latitude: -8.1256,
    longitude: -34.9458,
    ponto_apoio_proximo: 'Escola Municipal Sociólogo Gilberto Freyre',
    fator_vulnerabilidade: 'Barreiras sujeitas a deslizamento e acúmulo de água',
  },
  {
    id: 4,
    nome_local: 'Córrego do Jenipapo (Zona Norte)',
    tipo_ecossistema: 'Encosta / Margem de Córrego',
    latitude: -8.0158,
    longitude: -34.9364,
    ponto_apoio_proximo: 'Escola Municipal Córrego do Jenipapo',
    fator_vulnerabilidade: 'Transbordamento rápido do córrego e encostas adjacentes',
  },
  {
    id: 5,
    nome_local: 'Ilha de Deus / Imbiribeira (Zona Sul)',
    tipo_ecossistema: 'Estuário / Manguezal',
    latitude: -8.0975,
    longitude: -34.9092,
    ponto_apoio_proximo: 'Escola Municipal Paulo VI',
    fator_vulnerabilidade: 'Encontro dos rios Jordão, Tejipió e Pina com maré alta',
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

  private salvarCacheOffline(territorioId: number, alerta: AlertaTerritorial): void {
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

    if (chuva >= 15.0) {
      return {
        territorio_id: local.id,
        territorio: local.nome_local,
        ecossistema: local.tipo_ecossistema,
        precipitacao_mm: chuva,
        temperatura_c: 26.0,
        nivel_risco: 'CRÍTICO',
        alerta_humanizado: `Atenção urgente em ${local.nome_local}! Está chovendo muito forte agora (${chuva.toFixed(1)} mm/h). Há risco imediato de deslizamento de barreira ou alagamento rápido na área de ${local.tipo_ecossistema}.`,
        acao_segura: `Saia de áreas de encosta ou beira de canal imediatamente, avise seus vizinhos e procure abrigo seguro em: ${local.ponto_apoio_proximo}. Em emergência, ligue 199 (Defesa Civil).`,
        cuidado_ambiental:
          'Não tente desentupir bueiros durante a enxurrada e mantenha distância das margens dos rios e mangues.',
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
        ecossistema: local.tipo_ecossistema,
        precipitacao_mm: chuva,
        temperatura_c: 27.0,
        nivel_risco: 'MODERADO',
        alerta_humanizado: `Fique ligado, morador de ${local.nome_local}: chuva moderada (${chuva.toFixed(1)} mm/h) atingindo a região de ${local.tipo_ecossistema}. O solo já começa a acumular água.`,
        acao_segura: `Separe documentos em saco plástico, carregue o celular e deixe a rota pronta até: ${local.ponto_apoio_proximo}.`,
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
      ecossistema: local.tipo_ecossistema,
      precipitacao_mm: chuva,
      temperatura_c: 28.5,
      nivel_risco: 'BAIXO',
      alerta_humanizado: `Tudo tranquilo em ${local.nome_local} no momento (${chuva.toFixed(1)} mm/h). Sem risco imediato de chuva forte.`,
      acao_segura: `Acompanhe as atualizações pelo aplicativo e conheça o ponto de apoio da sua comunidade: ${local.ponto_apoio_proximo}.`,
      cuidado_ambiental: `Proteger a área de ${local.tipo_ecossistema} hoje evita tragédias amanhã: descarte resíduos apenas nos pontos de coleta.`,
      ponto_apoio: local.ponto_apoio_proximo,
      fator_vulnerabilidade: local.fator_vulnerabilidade,
      fonte_ia: 'cache_offline_seguro',
      atualizado_em: new Date().toISOString(),
    };
  }
}

