import type { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { EmpleadosComponent } from './components/empleados/empleados';
import { ProcesosComponent } from './components/procesos/procesos';
import { ProcesoEditorComponent } from './components/proceso-editor/proceso-editor';
import { PoolsComponent } from './components/pools/pools';
import { RolesProcesoComponent } from './components/roles-proceso/roles-proceso';
import { LanesComponent } from './components/lanes/lanes';
import { RolesPoolAdminComponent } from './components/roles-pool-admin/roles-pool-admin';
import { MensajesProcesoComponent } from './components/mensajes-proceso/mensajes-proceso';
import { ConectoresComponent } from './components/conectores/conectores';
import { ActividadesComponent } from './components/actividades/actividades';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

/**
 * Rutas de la aplicación con protección de autenticación y roles.
 *
 * Roles del sistema:
 *   ADMINISTRADOR_EMPRESA → acceso total
 *   EDITOR               → puede editar procesos, ver pools, lanes, mensajes, conectores
 *   SOLO_LECTURA         → solo puede ver procesos y mensajes
 *
 * canActivate recibe un array — Angular ejecuta los guards en orden.
 * Si authGuard falla, roleGuard ni siquiera se ejecuta.
 */
export const routes: Routes = [
  // Ruta pública — no requiere autenticación
  { path: 'login', component: LoginComponent },

  // Registro de empresa — ruta pública
  {
    path: 'registro-empresa',
    loadComponent: () =>
      import('./components/registro-empresa/registro-empresa')
        .then(m => m.RegistroEmpresa)
  },

  // ─── Rutas de ADMINISTRADOR_EMPRESA y Administradores de Pool ────────
  {
    path: 'empleados',
    component: EmpleadosComponent,
    canActivate: [authGuard] // El componente verifica internamente si es Admin de Empresa o Admin de Pool
  },

  // ─── Rutas de ADMINISTRADOR_EMPRESA únicamente ───────────────────────────
  {
    path: 'roles-proceso',
    component: RolesProcesoComponent,
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR_EMPRESA'])]
  },
  {
    path: 'roles-pool',
    component: RolesPoolAdminComponent,
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR_EMPRESA'])]
  },

  // ─── Rutas de ADMINISTRADOR_EMPRESA y EDITOR ─────────────────────────────
  {
    path: 'pools',
    component: PoolsComponent,
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR_EMPRESA', 'EDITOR'])]
  },
  {
    path: 'editor/:id',
    component: ProcesoEditorComponent,
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR_EMPRESA', 'EDITOR'])]
  },
  {
    path: 'lanes',
    component: LanesComponent,
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR_EMPRESA', 'EDITOR'])]
  },
  {
    path: 'conectores',
    component: ConectoresComponent,
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR_EMPRESA', 'EDITOR'])]
  },
  {
    path: 'procesos/:id/actividades',
    component: ActividadesComponent,
    canActivate: [authGuard, roleGuard(['ADMINISTRADOR_EMPRESA', 'EDITOR'])]
  },

  // ─── Rutas accesibles por TODOS los roles ────────────────────────────────
  {
    path: 'procesos',
    component: ProcesosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'mensajes',
    component: MensajesProcesoComponent,
    canActivate: [authGuard]
  },

  // Ruta raíz → redirige al login
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
