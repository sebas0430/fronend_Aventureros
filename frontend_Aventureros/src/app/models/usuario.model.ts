/**
 * Roles globales que existen en el sistema.
 * Coinciden exactamente con el enum RolGlobal del backend.
 */
export type RolGlobal = 'ADMINISTRADOR_EMPRESA' | 'EDITOR' | 'SOLO_LECTURA';

export interface Usuario {
  id: number;
  correo: string;
  rol: RolGlobal;
  activo: boolean;
  empresaId: number;
}

export interface Empresa {
  id: number;
  nombre: string;
  nit: string;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

/**
 * El backend retorna directamente los datos del usuario al hacer login,
 * sin JWT por ahora. Esta interfaz refleja la respuesta real del backend (UsuarioLoginDTO).
 */
export interface LoginResponse {
  usuario: Usuario;
}
