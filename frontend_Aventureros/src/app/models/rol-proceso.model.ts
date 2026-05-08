// HU-17/18/19/20 — Roles de Proceso (funciones dentro de la empresa)
export interface RolProceso {
  id: number;
  nombre: string;
  descripcion: string;
  empresaId: number;
  usuarioId?: number;
  createdAt?: string;
}

export interface RolProcesoDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  empresaId: number;
  usoEnProcesos: ProcesoUso[];
}

export interface ProcesoUso {
  procesoId: number;
  procesoNombre: string;
  actividades: ActividadUso[];
}

export interface ActividadUso {
  actividadId: number;
  actividadNombre: string;
  tipoActividad: string;
}
