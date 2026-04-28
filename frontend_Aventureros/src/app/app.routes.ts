import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { EmpleadosComponent } from './components/empleados/empleados';
import { ProcesosComponent } from './components/procesos/procesos';
import { ProcesoEditorComponent } from './components/proceso-editor/proceso-editor';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login',        component: LoginComponent },
  { path: 'empleados',    component: EmpleadosComponent,     canActivate: [authGuard] },
  { path: 'procesos',     component: ProcesosComponent,      canActivate: [authGuard] },
  { path: 'editor/:id',   component: ProcesoEditorComponent, canActivate: [authGuard] },
  { path: '',             redirectTo: 'login', pathMatch: 'full' }
];
