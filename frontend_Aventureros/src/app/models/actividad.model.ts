export enum RolGlobal {
  ADMINISTRADOR_EMPRESA = 'ADMINISTRADOR_EMPRESA',
  EDITOR = 'EDITOR',
  SOLO_LECTURA = 'SOLO_LECTURA'
}

export interface Actividad {
  id?: number;
  nombre: string;
  tipoActividad: string;
  descripcion: string;
  rolResponsable: RolGlobal;
  orden?: number;
  procesoId: number;
  usuarioId: number;
}

export interface ActividadRegistroDTO {
  id?: number;
  nombre: string;
  tipoActividad: string;
  descripcion: string;
  rolResponsable: RolGlobal;
  orden?: number;
  procesoId: number;
  usuarioId: number;
}

export interface ActividadEdicionDTO {
  id?: number;
  nombre: string;
  tipoActividad: string;
  descripcion: string;
  rolResponsable: RolGlobal;
  orden?: number;
  usuarioId: number;
}
