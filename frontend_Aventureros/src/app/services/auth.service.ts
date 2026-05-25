import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Usuario, RolGlobal, LoginRequest, LoginResponse } from '../models/usuario.model';

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
   * El backend retorna un UsuarioLoginDTO con: id, correo, rol, activo, empresaId.
   * Nota: el backend usa el campo "correo" que internamente es el "username" en la BD.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => {
        // El backend retorna UsuarioLoginDTO directamente (sin token JWT por ahora).
        // Mapeamos al modelo interno de la app.
        const usuario: Usuario = {
          id:        response.id,
          correo:    response.correo,
          rol:       response.rol as RolGlobal,
          activo:    response.activo,
          empresaId: response.empresaId
        };
        return { usuario };
      }),
      tap((response: LoginResponse) => {
        if (isPlatformBrowser(this.platformId)) {
          // Guardamos los datos del usuario para mantener la sesión entre recargas.
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
        }
        this.usuarioActual.set(response.usuario);
      })
    );
  }

  /**
   * Cierra la sesión: limpia los datos de sesión y el signal reactivo.
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
   * Por ahora el backend no emite tokens, así que esto retorna null.
   * Cuando el backend implemente JWT, este método funcionará automáticamente.
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Indica si hay una sesión activa verificando si hay datos de usuario guardados.
   */
  isAuthenticated(): boolean {
    return this.usuarioActual() !== null;
  }

  /**
   * Devuelve los datos completos del usuario logueado.
   */
  getUsuario(): Usuario | null {
    return this.usuarioActual();
  }

  /**
   * Devuelve el rol del usuario logueado, o null si no hay sesión.
   * Útil para los role guards.
   */
  getRol(): RolGlobal | null {
    return this.usuarioActual()?.rol ?? null;
  }

  /**
   * Devuelve el ID del usuario logueado, o null si no hay sesión.
   */
  getUserId(): number | null {
    return this.usuarioActual()?.id ?? null;
  }

  /**
   * Verifica si el usuario logueado tiene alguno de los roles especificados.
   * Método de conveniencia para usarlo en templates o servicios.
   */
  tieneRol(...roles: RolGlobal[]): boolean {
    const rolActual = this.getRol();
    return rolActual !== null && roles.includes(rolActual);
  }

  /**
   * [PREPARADO PARA BACKEND] Intenta renovar el token JWT cuando este vence.
   * Actualmente el backend no implementa JWT, por lo que este método
   * retorna un error inmediatamente. Cuando el backend agregue el endpoint
   * POST /api/usuarios/refresh, solo hay que actualizar esta implementación.
   *
   * Flujo esperado cuando el backend lo implemente:
   *   1. Enviar el token actual al backend
   *   2. El backend valida y retorna un token nuevo
   *   3. Guardar el token nuevo en localStorage
   *   4. El interceptor reintentará la petición original
   */
  refreshToken(): Observable<{ token: string }> {
    const tokenActual = this.getToken();
    return this.http.post<{ token: string }>(`${this.apiUrl}/refresh`, { token: tokenActual }).pipe(
      tap((response) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('auth_token', response.token);
        }
      }),
      catchError((error) => {
        // Si el refresh falla, cerramos la sesión por seguridad.
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Carga el usuario desde localStorage al arrancar el servicio.
   * Permite mantener la sesión al recargar la página.
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
