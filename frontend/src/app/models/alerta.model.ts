export type NivelRisco = 'BAIXO' | 'MODERADO' | 'CRÍTICO';

export interface Territorio {
  id: number;
  nome_local: string;
  bairro?: string;
  microterritorio?: string;
  topografia_risco?: string;
  tipo_ecossistema: string;
  latitude: number;
  longitude: number;
  ponto_apoio_proximo: string;
  fator_vulnerabilidade?: string;
  rota_fuga_segura?: string;
}

export interface AlertaTerritorial {
  territorio_id?: number;
  territorio: string;
  bairro?: string;
  microterritorio?: string;
  topografia_risco?: string;
  rota_fuga_segura?: string;
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
  recebido_via_p2p?: boolean;
}

export interface PacoteAlertaOfflineP2P {
  v: number; // versão do protocolo
  id: number;
  t: string; // território / microterritório
  b?: string; // bairro
  r: string; // nível de risco
  c: number; // chuva mm
  m: string; // mensagem simplificada
  s: string; // ação segura
  f?: string; // rota de fuga
  a: string; // abrigo/ponto de apoio
  ts: string; // timestamp
}

