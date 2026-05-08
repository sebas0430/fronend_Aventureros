// HU-25/27/28 — Eventos de mensaje entre procesos (Message Throw / Catch)
export type TipoEventoMensaje = 'THROW' | 'CATCH';
export type ComportamientoFallback = 'GUARDAR' | 'REINTENTAR' | 'ERROR';

export interface EventoMensaje {
  id?: number;
  nombreMensaje: string;
  tipo: TipoEventoMensaje;
  payloadSchema?: string;
  fallback?: ComportamientoFallback;
  procesoId: number;
  usuarioId?: number;
  createdAt?: string;
}

export interface MensajeEjecucion {
  id?: number;
  eventoOrigenId: number;
  procesoCatchId: number;
  payload?: string;
  estado?: string;
  creadoEn?: string;
}
