import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service';
import { PoolService } from '../../services/pool.service';
import { RolPoolService } from '../../services/rol-pool.service';
import { AuthService } from '../../services/auth.service';
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
  private poolService    = inject(PoolService);
  private rolPoolService = inject(RolPoolService);
  private router         = inject(Router);
  private platformId     = inject(PLATFORM_ID);
  // Expuesto como public para poder usarlo directamente en el template HTML.
  authService            = inject(AuthService);

  usuarioLogueado = signal<Usuario | null>(null);
  nombreEmpresa = signal('Cargando...');
  isCollapsed = signal(false);
  isPoolAdmin = signal(false);

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

    if (user.rol !== 'ADMINISTRADOR_EMPRESA') {
      this.verificarSiEsPoolAdmin(user);
    }
  }

  private verificarSiEsPoolAdmin(user: Usuario) {
    this.poolService.listarPorEmpresa(user.empresaId).subscribe({
      next: (pools) => {
        pools.forEach(pool => {
          this.rolPoolService.obtenerRolDeUsuario(user.id, pool.id).subscribe({
            next: (asignacion) => {
              if (asignacion) {
                this.rolPoolService.listarRolesPorPool(pool.id, user.id).subscribe({
                  next: (roles) => {
                    const rol = roles.find(r => r.id === asignacion.rolPoolId);
                    if (rol && rol.nombre.toLowerCase().includes('administrador')) {
                      this.isPoolAdmin.set(true);
                    }
                  }
                });
              }
            }
          });
        });
      }
    });
  }

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  logout() {
    // Usamos el AuthService para cerrar sesión correctamente (limpia todo y resetea el signal).
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRolLabel(rol: string): string {
    // Roles reales del sistema (coinciden con el enum RolGlobal del backend).
    const roles: Record<string, string> = {
      ADMINISTRADOR_EMPRESA: 'Administrador',
      EDITOR:                'Editor',
      SOLO_LECTURA:          'Solo Lectura'
    };
    return roles[rol] ?? rol;
  }

  getInitials(correo: string): string {
    return correo ? correo.substring(0, 2).toUpperCase() : '';
  }
}
