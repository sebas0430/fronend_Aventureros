import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolGlobal } from '../models/usuario.model';

/**
 * Guard funcional de roles que protege rutas según el rol del usuario logueado.
 *
 * ¿Cómo funciona?
 * - Recibe una lista de roles que tienen permiso para entrar a la ruta.
 * - Si el usuario no está logueado → redirige a /login.
 * - Si está logueado pero no tiene el rol requerido → redirige a /procesos (sin acceso).
 * - Si tiene el rol correcto → permite el acceso.
 *
 * ¿Cómo se usa en app.routes.ts?
 * ```typescript
 * {
 *   path: 'empleados',
 *   component: EmpleadosComponent,
 *   canActivate: [authGuard, roleGuard(['ADMINISTRADOR_EMPRESA'])]
 * }
 * ```
 *
 * @param rolesPermitidos - Lista de roles que pueden acceder a la ruta.
 */
export function roleGuard(rolesPermitidos: RolGlobal[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    // Primero verificamos que haya sesión activa.
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    // Verificamos si el rol del usuario está en la lista de roles permitidos.
    const tienePermiso = authService.tieneRol(...rolesPermitidos);

    if (!tienePermiso) {
      // El usuario está logueado pero no tiene el rol necesario.
      // Lo mandamos a /procesos que es la ruta principal para todos los roles.
      router.navigate(['/procesos']);
      return false;
    }

    return true;
  };
}
