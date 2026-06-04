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
 * Respuesta del login del backend (UsuarioLoginDTO).
 * Incluye los datos del usuario y el token JWT para autenticación.
 */
export interface LoginResponse {
  usuario: Usuario;
  token?: string;
}
