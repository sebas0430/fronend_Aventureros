import { Component, signal, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { EmpresaService } from '../../services/empresa.service';
import { PoolService } from '../../services/pool.service';
import { RolPoolService } from '../../services/rol-pool.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';
import { Pool } from '../../models/pool.model';
import { RolPool } from '../../models/rol-pool.model';
import { InvitarUsuarioComponent } from '../invitar-usuario/invitar-usuario';
import { NavbarComponent } from '../navbar/navbar';
import { ConfirmarEliminarComponent } from '../confirmar-eliminar/confirmar-eliminar';
import { UsuarioDetalleComponent } from '../usuario-detalle/usuario-detalle';
import { AsignarPoolComponent } from '../asignar-pool/asignar-pool';
import { EmpleadoCardComponent } from '../empleado-card/empleado-card';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, InvitarUsuarioComponent, NavbarComponent, ConfirmarEliminarComponent, UsuarioDetalleComponent, AsignarPoolComponent, EmpleadoCardComponent],
  templateUrl: './empleados.html',
  styleUrl: './empleados.css'
})
export class EmpleadosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);
  private poolService = inject(PoolService);
  private rolPoolService = inject(RolPoolService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);  
  empleados        = signal<Usuario[]>([]);
  usuarioLogueado  = signal<Usuario | null>(null);
  isLoading        = signal(true);
  errorMessage     = signal('');
  mostrarModal     = signal(false);
  empleadoAEliminar = signal<Usuario | null>(null);
  eliminando       = signal(false);
  usuarioSeleccionadoId = signal<number | null>(null);
  usuarioParaAsignarPool = signal<Usuario | null>(null);

  pools = signal<Pool[]>([]);
  rolesMap = signal<Record<number, RolPool>>({}); // rolId -> RolPool
  asignacionesMap = signal<Record<number, {pool: Pool, rol: RolPool}[]>>({});

  filtroPool = signal<string>('TODOS');
  poolsAdministrados = signal<Set<number>>(new Set()); // IDs de los pools que administra el usuario actual


  empleadosFiltrados = computed(() => {
    const list = this.empleados();
    const fPool = this.filtroPool();
    const asignaciones = this.asignacionesMap();
    const logueado = this.usuarioLogueado();
    const adminPools = this.poolsAdministrados();

    return list.filter(emp => {
      const susAsignaciones = asignaciones[emp.id] || [];

      // Si no es admin de la empresa, solo puede ver a los de sus pools administrados
      if (logueado && logueado.rol !== 'ADMINISTRADOR_EMPRESA') {
        const estaEnPoolAdministrado = susAsignaciones.some(a => adminPools.has(a.pool.id));
        if (!estaEnPoolAdministrado) return false;
      }

      // Filtro por dropdown
      if (fPool !== 'TODOS') {
        const poolId = parseInt(fPool, 10);
        if (!susAsignaciones.some(a => a.pool.id === poolId)) return false;
      }
      return true;
    });
  });

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const u = this.authService.getUsuario();
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.usuarioLogueado.set(u);
    
    if (u.rol === 'ADMINISTRADOR_EMPRESA') {
      this.cargarEmpleados(u);
    } else {
      this.verificarPermisosPoolAdmin(u);
    }
  }

  private verificarPermisosPoolAdmin(user: Usuario) {
    this.isLoading.set(true);
    this.poolService.listarPorEmpresa(user.empresaId).subscribe({
      next: (pools) => {
        if (pools.length === 0) {
          this.router.navigate(['/procesos']);
          return;
        }

        let pending = pools.length;
        const administrados = new Set<number>();

        pools.forEach(pool => {
          this.rolPoolService.obtenerRolDeUsuario(user.id, pool.id).subscribe({
            next: (asignacion) => {
              if (asignacion) {
                // Obtener detalles del rol para saber si es administrador
                this.rolPoolService.listarRolesPorPool(pool.id, user.id).subscribe({
                  next: (roles) => {
                    const rol = roles.find(r => r.id === asignacion.rolPoolId);
                    if (rol && rol.nombre.toLowerCase().includes('administrador')) {
                      administrados.add(pool.id);
                    }
                    pending--;
                    this.checkAdminComplete(pending, administrados, user);
                  },
                  error: () => { pending--; this.checkAdminComplete(pending, administrados, user); }
                });
              } else {
                pending--;
                this.checkAdminComplete(pending, administrados, user);
              }
            },
            error: () => {
              pending--;
              this.checkAdminComplete(pending, administrados, user);
            }
          });
        });
      },
      error: () => {
        this.router.navigate(['/procesos']);
      }
    });
  }

  private checkAdminComplete(pending: number, administrados: Set<number>, user: Usuario) {
    if (pending === 0) {
      if (administrados.size > 0) {
        this.poolsAdministrados.set(administrados);
        this.cargarEmpleados(user);
      } else {
        this.router.navigate(['/procesos']);
      }
    }
  }

  private cargarEmpleados(user: Usuario) {
    this.isLoading.set(true);
    this.usuarioService.listarPorEmpresa(user.empresaId).subscribe({
      next: (lista) => {
        const filtrados = lista.filter(e => e.id !== user.id);
        this.empleados.set(filtrados);
        this.isLoading.set(false);
        this.cargarPoolsYRols(user);
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err);
        this.errorMessage.set('No se pudo cargar la lista de compañeros.');
        this.isLoading.set(false);
      }
    });
  }

  cargarPoolsYRols(logueado: Usuario) {
    this.poolService.listarPorEmpresa(logueado.empresaId).subscribe({
      next: (pools) => {
        this.pools.set(pools);
        if (pools.length === 0) return;

        let pendingPools = pools.length;
        const tempRolesMap: Record<number, RolPool> = {};

        pools.forEach(pool => {
          this.rolPoolService.listarRolesPorPool(pool.id, logueado.id).subscribe({
            next: (roles) => {
              roles.forEach(r => tempRolesMap[r.id] = r);
              pendingPools--;
              if (pendingPools === 0) {
                this.rolesMap.set(tempRolesMap);
                this.cargarAsignaciones(pools);
              }
            },
            error: () => {
              pendingPools--;
              if (pendingPools === 0) {
                this.rolesMap.set(tempRolesMap);
                this.cargarAsignaciones(pools);
              }
            }
          });
        });
      }
    });
  }

  cargarAsignaciones(pools: Pool[]) {
    const empleadosList = this.empleados();
    let pendingRequests = pools.length * empleadosList.length;
    const tempAsignaciones: Record<number, {pool: Pool, rol: RolPool}[]> = {};

    if (pendingRequests === 0) return;

    empleadosList.forEach(emp => {
      tempAsignaciones[emp.id] = [];
      pools.forEach(pool => {
        this.rolPoolService.obtenerRolDeUsuario(emp.id, pool.id).subscribe({
          next: (asignacion) => {
            if (asignacion) {
              const rol = this.rolesMap()[asignacion.rolPoolId];
              if (rol) tempAsignaciones[emp.id].push({ pool, rol });
            }
            pendingRequests--;
            if (pendingRequests === 0) this.asignacionesMap.set(tempAsignaciones);
          },
          error: () => {
            pendingRequests--;
            if (pendingRequests === 0) this.asignacionesMap.set(tempAsignaciones);
          }
        });
      });
    });
  }

  abrirModal()  { this.mostrarModal.set(true);  }
  cerrarModal() { this.mostrarModal.set(false); }

  onInvitacionExitosa() {
    const user = this.usuarioLogueado();
    if (user) this.cargarEmpleados(user);
  }

  eliminarEmpleado(empleado: Usuario) {
    this.empleadoAEliminar.set(empleado);
  }

  cerrarModalEliminar() {
    this.empleadoAEliminar.set(null);
  }

  verDetalles(id: number) {
    this.usuarioSeleccionadoId.set(id);
  }

  cerrarDetalles() {
    this.usuarioSeleccionadoId.set(null);
  }

  abrirAsignarPool(empleado: Usuario) {
    this.usuarioParaAsignarPool.set(empleado);
  }

  cerrarAsignarPool(recargar: boolean = false) {
    this.usuarioParaAsignarPool.set(null);
    if (recargar) {
      const user = this.usuarioLogueado();
      if (user) this.cargarPoolsYRols(user);
    }
  }

  confirmarEliminar() {
    const empleado = this.empleadoAEliminar();
    if (!empleado) return;

    this.eliminando.set(true);
    this.usuarioService.eliminarUsuario(empleado.id).subscribe({
      next: () => {
        this.empleados.update(lista => lista.filter(e => e.id !== empleado.id));
        this.cerrarModalEliminar();
        this.eliminando.set(false);
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        // Si hay un error 500, mostramos un mensaje amigable
        const msg = err.error?.message || err.message;
        this.errorMessage.set(msg.includes('foreign key') ? 'No se puede eliminar porque tiene procesos o historiales asociados.' : 'No se pudo eliminar al compañero.');
        this.cerrarModalEliminar();
        this.eliminando.set(false);
      }
    });
  }

  cambiarRol(empleado: Usuario, nuevoRol: string) {
    if (!nuevoRol || nuevoRol === empleado.rol) return;
    this.usuarioService.cambiarRol(empleado.id, nuevoRol).subscribe({
      next: () => {
        this.empleados.update(lista =>
          lista.map(e => e.id === empleado.id ? { ...e, rol: nuevoRol } : e)
        );
      },
      error: (err) => {
        console.error('Error al cambiar rol:', err);
        this.errorMessage.set('No se pudo cambiar el rol del compañero.');
      }
    });
  }

  toggleActivo(empleado: Usuario) {
    const nuevoEstado = !empleado.activo;
    this.usuarioService.cambiarActivo(empleado.id, nuevoEstado).subscribe({
      next: () => {
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

  getRolLabel(rol: string): string {
    const roles: Record<string, string> = {
      ADMINISTRADOR_EMPRESA: 'Administrador',
      EDITOR: 'Editor',
      SOLO_LECTURA: 'Solo Lectura'
    };
    return roles[rol] ?? rol;
  }

  getRolColor(rol: string): string {
    const colors: Record<string, string> = {
      ADMINISTRADOR_EMPRESA: 'badge-admin',
      EDITOR: 'badge-editor',
      SOLO_LECTURA: 'badge-lector'
    };
    return colors[rol] ?? 'badge-lector';
  }

  getInitials(correo: string): string {
    return correo.substring(0, 2).toUpperCase();
  }

  removerPool(empId: number, poolId: number) {
    const admin = this.usuarioLogueado();
    if (!admin) return;

    this.rolPoolService.removerAsignacion(empId, poolId, admin.id).subscribe({
      next: () => {
        this.asignacionesMap.update(map => {
          const newMap = { ...map };
          if (newMap[empId]) {
            newMap[empId] = newMap[empId].filter(a => a.pool.id !== poolId);
          }
          return newMap;
        });
      },
      error: (err) => {
        console.error('Error al remover pool:', err);
        this.errorMessage.set('No se pudo quitar el departamento.');
      }
    });
  }
}
