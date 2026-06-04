import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional que:
 * 1. Adjunta el token JWT como header Authorization en cada petición HTTP (cuando existe).
 * 2. Si el backend responde 401 (no autorizado / token vencido):
 *    a. Intenta renovar el token llamando a refreshToken().
 *    b. Si la renovación funciona → reintenta la petición original con el token nuevo.
 *    c. Si la renovación falla → cierra la sesión y redirige al login.
 *
 * NOTA: Mientras el backend no implemente JWT, el token siempre será null
 * y el bloque de refresh no se activará (el backend acepta todo sin token).
 * Cuando el backend implemente JWT, este interceptor funcionará automáticamente.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // No adjuntar token a las peticiones de login ni de refresh (evitar bucle infinito).
  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    return next(req);
  }

  // Agregar token a la petición si existe uno.
  const reqConToken = agregarToken(req, authService.getToken());

  return next(reqConToken).pipe(
    catchError((error) => {
      // Si el backend responde 401, intentamos renovar el token antes de rendirse.
      if (error.status === 401) {
        const tokenActual = authService.getToken();

        // Si hay un token guardado, intentamos renovarlo.
        // (Si no hay token, el backend está rechazando por otra razón → logout directo.)
        if (tokenActual) {
          if (!authService.isRefreshing) {
            authService.isRefreshing = true;
            authService.refreshTokenSubject.next(null);

            return authService.refreshToken().pipe(
              switchMap((respuesta) => {
                authService.isRefreshing = false;
                authService.refreshTokenSubject.next(respuesta.token);
                // Refresh exitoso: reintentamos la petición original con el token nuevo.
                const reqReintentar = agregarToken(req, respuesta.token);
                return next(reqReintentar);
              }),
              catchError((errorRefresh) => {
                authService.isRefreshing = false;
                // El refresh también falló (token inválido o sesión expirada definitivamente).
                authService.logout();
                router.navigate(['/login']);
                return throwError(() => errorRefresh);
              })
            );
          } else {
            // Si ya se está refrescando, esperamos a que se emita un token válido
            return authService.refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap((token) => {
                return next(agregarToken(req, token));
              })
            );
          }
        }

        // Sin token → sesión inválida, mandamos al login.
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Clona la petición HTTP y agrega el header Authorization si hay un token disponible.
 */
function agregarToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
