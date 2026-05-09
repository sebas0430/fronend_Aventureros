import type { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { EmpleadosComponent } from './components/empleados/empleados';
import { ProcesosComponent } from './components/procesos/procesos';
import { ProcesoEditorComponent } from './components/proceso-editor/proceso-editor';
import { PoolsComponent } from './components/pools/pools';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login',        component: LoginComponent },
  { path: 'empleados',    component: EmpleadosComponent,     canActivate: [authGuard] },
  { path: 'procesos',     component: ProcesosComponent,      canActivate: [authGuard] },
  { path: 'editor/:id',   component: ProcesoEditorComponent, canActivate: [authGuard] },
  { path: 'pools',        component: PoolsComponent,         canActivate: [authGuard] },
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
  { path: '',             redirectTo: 'login', pathMatch: 'full' }
];
