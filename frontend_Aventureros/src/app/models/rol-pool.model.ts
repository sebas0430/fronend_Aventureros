export interface RolPool {
  id: number;
  nombre: string;
  poolId: number;
  permisoCrearProceso: boolean;
  permisoEditarProceso: boolean;
  permisoEliminarProceso: boolean;
  permisoPublicarProceso: boolean;
  permisoGestionarRoles: boolean;
  descripcion?: string;
}

export interface AsignacionRolDTO {
  usuarioDestinoId: number;
  rolPoolId: number;
  poolId: number;
  usuarioId: number;
}
