import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional que adjunta el token JWT como header Authorization
 * en cada petición HTTP saliente (excepto la de login).
 *
 * Si el backend responde con 401 (no autorizado), cierra la sesión
 * automáticamente y redirige al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No adjuntar token a la petición de login
  if (req.url.includes('/login')) {
    return next(req);
  }

  const token = authService.getToken();

  // Clonar la request y adjuntar el header Authorization si hay token
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      // Si el backend responde 401, la sesión expiró o el token es inválido
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
