export type NivelRisco = 'BAIXO' | 'MODERADO' | 'CRÍTICO';

export interface Territorio {
  id: number;
  nome_local: string;
  tipo_ecossistema: string;
  latitude: number;
  longitude: number;
  ponto_apoio_proximo: string;
  fator_vulnerabilidade?: string;
}

export interface AlertaTerritorial {
  territorio_id?: number;
  territorio: string;
  ecossistema: string;
  precipitacao_mm: number;
  temperatura_c: number;
  nivel_risco: NivelRisco | string;
  alerta_humanizado: string;
  acao_segura: string;
  cuidado_ambiental: string;
  ponto_apoio: string;
  fator_vulnerabilidade?: string;
  fonte_ia?: string;
  atualizado_em?: string;
}

