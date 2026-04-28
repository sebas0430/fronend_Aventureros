export interface Usuario {
  id: number;
  correo: string;
  rol: string;
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

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
