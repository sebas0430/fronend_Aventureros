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
  actividadId?: number; // Vínculo con la entidad Actividad en DB
  gatewayType?: 'exclusive' | 'parallel' | 'inclusive';
}

export interface ConexionBpmn {
  id: string;
  desde: string;
  hasta: string;
  label?: string;
  condicion?: string;
}

export interface DefinicionBpmn {
  nodos: NodoBpmn[];
  conexiones: ConexionBpmn[];
}

// ── Compartición con Pools ─────────────────────────────────────
export type PermisoCompartido = 'LECTURA' | 'LECTURA_ESCRITURA';

export interface ProcesoCompartirDTO {
  poolDestinoId: number;
  permiso: PermisoCompartido;
  usuarioId: number;
}
