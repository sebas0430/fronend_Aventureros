import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  usuarioLogueado = signal<Usuario | null>(null);
  nombreEmpresa = signal('Cargando...');

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedUser = localStorage.getItem('usuario');
    if (!storedUser) return;

    const user: Usuario = JSON.parse(storedUser);
    this.usuarioLogueado.set(user);

    this.empresaService.obtenerEmpresa(user.empresaId).subscribe({
      next: (empresa) => this.nombreEmpresa.set(empresa.nombre),
      error: () => this.nombreEmpresa.set('Mi Empresa')
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  getRolLabel(rol: string): string {
    const roles: Record<string, string> = {
      ADMINISTRADOR_EMPRESA: 'Administrador',
      EMPLEADO: 'Empleado',
      SUPERVISOR: 'Supervisor'
    };
    return roles[rol] ?? rol;
  }

  getInitials(correo: string): string {
    return correo ? correo.substring(0, 2).toUpperCase() : '';
  }
}
