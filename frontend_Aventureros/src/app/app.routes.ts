import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { EmpleadosComponent } from './components/empleados/empleados';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'empleados', component: EmpleadosComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
