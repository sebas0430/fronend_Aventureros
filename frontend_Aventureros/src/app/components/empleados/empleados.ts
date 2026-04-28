import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { EmpresaService } from '../../services/empresa.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empleados.html',
  styleUrl: './empleados.css'
})
export class EmpleadosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  empleados = signal<Usuario[]>([]);
  usuarioLogueado = signal<Usuario | null>(null);
  nombreEmpresa = signal('Cargando...');
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    // El AuthGuard ya garantiza que el usuario está autenticado
    const user = this.authService.getUsuario();
    if (!user) return;

    this.usuarioLogueado.set(user);

    // Cargar nombre de la empresa
    this.empresaService.obtenerEmpresa(user.empresaId).subscribe({
      next: (empresa) => this.nombreEmpresa.set(empresa.nombre),
      error: () => this.nombreEmpresa.set('Mi Empresa')
    });

    // Cargar todos los empleados de la misma empresa y excluir al logueado
    this.usuarioService.listarPorEmpresa(user.empresaId).subscribe({
      next: (lista) => {
        const filtrados = lista.filter(e => e.id !== user.id);
        this.empleados.set(filtrados);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err);
        this.errorMessage.set('No se pudo cargar la lista de compañeros.');
        this.isLoading.set(false);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRolLabel(rol: string): string {
    const roles: Record<string, string> = {
      ADMIN: 'Administrador',
      EMPLEADO: 'Empleado',
      SUPERVISOR: 'Supervisor'
    };
    return roles[rol] ?? rol;
  }

  getRolColor(rol: string): string {
    const colors: Record<string, string> = {
      ADMIN: 'badge-admin',
      SUPERVISOR: 'badge-supervisor',
      EMPLEADO: 'badge-empleado'
    };
    return colors[rol] ?? 'badge-empleado';
  }

  getInitials(correo: string): string {
    return correo.substring(0, 2).toUpperCase();
  }

  toggleActivo(empleado: Usuario) {
    const nuevoEstado = !empleado.activo;
    this.usuarioService.cambiarActivo(empleado.id, nuevoEstado).subscribe({
      next: () => {
        // Actualiza el estado localmente sin recargar
        this.empleados.update(lista =>
          lista.map(e => e.id === empleado.id ? { ...e, activo: nuevoEstado } : e)
        );
      },
      error: (err) => {
        console.error('Error al cambiar activo:', err);
        this.errorMessage.set('No se pudo actualizar el estado del compañero.');
      }
    });
  }
}
