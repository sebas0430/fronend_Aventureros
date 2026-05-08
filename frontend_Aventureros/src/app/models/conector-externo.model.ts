// HU-26 — Conectores externos y notificaciones
export type TipoConectorExterno = 'EMAIL' | 'WEBHOOK' | 'QUEUE';

export interface ConectorExterno {
  id?: number;
  nombre: string;
  tipo: TipoConectorExterno;
  destino: string;
  puerto?: number;
  credencialRef?: string;
  usuarioAuth?: string;
  headersJson?: string;
  maxReintentos: number;
  empresaId: number;
  usuarioId?: number;
  createdAt?: string;
}

export interface EnvioExterno {
  conectorId: number;
  procesoId: number;
  payload: string;
  usuarioId: number;
}

export interface NotificacionExterna {
  id?: number;
  conectorId: number;
  procesoId: number;
  payload?: string;
  estado?: string;
  fechaEnvio?: string;
}
