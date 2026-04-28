import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Usuario, LoginRequest, LoginResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  /** Signal reactivo con el usuario logueado (null si no hay sesión) */
  usuarioActual = signal<Usuario | null>(this.cargarUsuarioDeStorage());

  /**
   * Inicia sesión contra el backend.
   * Guarda el token JWT y los datos del usuario en localStorage.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => {
        // El backend actual retorna directamente el usuario sin token.
        // Mapeamos a la estructura esperada y asignamos un token temporal.
        return {
          token: 'dummy-jwt-token',
          usuario: response as Usuario
        };
      }),
      tap((response) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
        }
        this.usuarioActual.set(response.usuario);
      })
    );
  }

  /**
   * Cierra la sesión: limpia token, datos de usuario y signal.
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('usuario');
    }
    this.usuarioActual.set(null);
  }

  /**
   * Devuelve el token JWT almacenado, o null si no existe.
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Indica si hay una sesión activa (token presente).
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Devuelve los datos del usuario logueado desde localStorage.
   */
  getUsuario(): Usuario | null {
    return this.usuarioActual();
  }

  /**
   * Carga el usuario desde localStorage al arrancar el servicio.
   */
  private cargarUsuarioDeStorage(): Usuario | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const stored = localStorage.getItem('usuario');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
