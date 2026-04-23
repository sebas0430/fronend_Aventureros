import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { EmpleadosComponent } from './components/empleados/empleados';
import { ProcesosComponent } from './components/procesos/procesos';
import { ProcesoEditorComponent } from './components/proceso-editor/proceso-editor';

export const routes: Routes = [
  { path: 'login',        component: LoginComponent },
  { path: 'empleados',    component: EmpleadosComponent },
  { path: 'procesos',     component: ProcesosComponent },
  { path: 'editor/:id',   component: ProcesoEditorComponent },
  { path: '',             redirectTo: 'login', pathMatch: 'full' }
];
