import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RolPoolService } from '../../services/rol-pool.service';
import { PoolService } from '../../services/pool.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar';
import { Pool } from '../../models/pool.model';
import { RolPool } from '../../models/rol-pool.model';

/** HU-24 — Gestión de Roles y Permisos por Pool */
@Component({
  selector: 'app-roles-pool-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './roles-pool-admin.html',
  styleUrl: './roles-pool-admin.css'
})
export class RolesPoolAdminComponent implements OnInit {
  private rolPoolService = inject(RolPoolService);
  private poolService = inject(PoolService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  pools = signal<Pool[]>([]);
  roles = signal<RolPool[]>([]);
  poolSeleccionado = signal<Pool | null>(null);
  isLoadingPools = signal(true);
  isLoadingRoles = signal(false);
  errorMsg = signal('');
  mostrarModal = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  rolEditandoId = signal<number | null>(null);

  form = signal({
    nombre: '', descripcion: '',
    permisoCrearProceso: false, permisoEditarProceso: false,
    permisoEliminarProceso: false, permisoPublicarProceso: false,
    permisoGestionarRoles: false
  });

  private usuarioId = 0;
  private empresaId = 0;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.authService.getUsuario();
    if (!user) { this.router.navigate(['/login']); return; }
    this.usuarioId = user.id;
    this.empresaId = user.empresaId;
    this.poolService.listarPorEmpresa(this.empresaId).subscribe({
      next: (p) => { this.pools.set(p); this.isLoadingPools.set(false); },
      error: () => { this.errorMsg.set('No se pudieron cargar los pools.'); this.isLoadingPools.set(false); }
    });
  }

  seleccionarPool(pool: Pool) {
    this.poolSeleccionado.set(pool);
    this.isLoadingRoles.set(true);
    this.rolPoolService.listarRolesPorPool(pool.id!, this.usuarioId).subscribe({
      next: (r) => { this.roles.set(r); this.isLoadingRoles.set(false); },
      error: () => { this.errorMsg.set('No se pudieron cargar los roles de este pool.'); this.isLoadingRoles.set(false); }
    });
  }

  abrirCrear() {
    this.modoEdicion.set(false); this.rolEditandoId.set(null);
    this.form.set({ nombre: '', descripcion: '', permisoCrearProceso: false, permisoEditarProceso: false, permisoEliminarProceso: false, permisoPublicarProceso: false, permisoGestionarRoles: false });
    this.mostrarModal.set(true);
  }

  abrirEditar(rol: any) {
    this.modoEdicion.set(true); this.rolEditandoId.set(rol.id);
    this.form.set({
      nombre: rol.nombre, descripcion: rol.descripcion ?? '',
      permisoCrearProceso: rol.permisoCrearProceso ?? false,
      permisoEditarProceso: rol.permisoEditarProceso ?? false,
      permisoEliminarProceso: rol.permisoEliminarProceso ?? false,
      permisoPublicarProceso: rol.permisoPublicarProceso ?? false,
      permisoGestionarRoles: rol.permisoGestionarRoles ?? false
    });
    this.mostrarModal.set(true);
  }

  cerrarModal() { this.mostrarModal.set(false); this.guardando.set(false); }

  guardar() {
    const pool = this.poolSeleccionado();
    const f = this.form();
    if (!pool || !f.nombre.trim()) return;
    this.guardando.set(true);
    const dto = { ...f, nombre: f.nombre.trim(), poolId: pool.id!, usuarioId: this.usuarioId };

    const obs = this.modoEdicion() && this.rolEditandoId() !== null
      ? this.http.put<any>(`http://localhost:8080/api/roles-pool/${this.rolEditandoId()}`, dto)
      : this.http.post<any>('http://localhost:8080/api/roles-pool', dto);

    obs.subscribe({
      next: () => { this.guardando.set(false); this.cerrarModal(); this.seleccionarPool(pool); },
      error: (err: any) => { this.errorMsg.set(err?.error?.message || 'Error al guardar.'); this.guardando.set(false); }
    });
  }

  setCheckbox(campo: string, valor: boolean) {
    this.form.update(f => ({ ...f, [campo]: valor }));
  }

  setFormField(campo: string, valor: any) {
    this.form.update(f => ({ ...f, [campo]: valor }));
  }
}
