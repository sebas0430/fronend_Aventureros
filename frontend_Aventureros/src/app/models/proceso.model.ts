export type EstadoProceso = 'BORRADOR' | 'PUBLICADO' | 'INACTIVO';

export interface Proceso {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: EstadoProceso;
  empresaId: number;
  autorId: number;
  poolId?: number;
  definicionJson?: string;
}

export interface CrearProcesoRequest {
  nombre: string;
  descripcion: string;
  categoria: string;
  empresaId: number;
  autorId: number;
  poolId?: number;
}

// ── BPMN Canvas types ──────────────────────────────────────────
export type NodoBpmnTipo = 'inicio' | 'fin' | 'actividad' | 'gateway';

export interface NodoBpmn {
  id: string;
  tipo: NodoBpmnTipo;
  label: string;
  x: number;
  y: number;
}

export interface ConexionBpmn {
  id: string;
  desde: string;
  hasta: string;
}

export interface DefinicionBpmn {
  nodos: NodoBpmn[];
  conexiones: ConexionBpmn[];
}
