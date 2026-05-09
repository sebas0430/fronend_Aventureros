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

export const routes: Routes = [
  { path: 'login',          component: LoginComponent },
  { path: 'empleados',      component: EmpleadosComponent,       canActivate: [authGuard] },
  { path: 'procesos',       component: ProcesosComponent,        canActivate: [authGuard] },
  { path: 'procesos/:id/actividades', component: ActividadesComponent, canActivate: [authGuard] },
  { path: 'editor/:id',     component: ProcesoEditorComponent,   canActivate: [authGuard] },
  { path: 'pools',          component: PoolsComponent,           canActivate: [authGuard] },
  { path: 'registro-empresa', loadComponent: () =>
    import('./components/registro-empresa/registro-empresa')
      .then(m => m.RegistroEmpresa)
  },
  {
  path: 'configuracion-empresa',
  loadComponent: () =>
    import('./components/configuracion-empresa/configuracion-empresa')
      .then(m => m.ConfiguracionEmpresa)
},
  { path: 'roles-proceso',  component: RolesProcesoComponent,    canActivate: [authGuard] },
  { path: 'lanes',          component: LanesComponent,           canActivate: [authGuard] },
  { path: 'roles-pool',     component: RolesPoolAdminComponent,  canActivate: [authGuard] },
  { path: 'mensajes',       component: MensajesProcesoComponent, canActivate: [authGuard] },
  { path: 'conectores',     component: ConectoresComponent,      canActivate: [authGuard] },
  { path: '',               redirectTo: 'login', pathMatch: 'full' }
];
