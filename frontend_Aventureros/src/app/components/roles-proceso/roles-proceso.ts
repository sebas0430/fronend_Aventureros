import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RolProcesoService } from '../../services/rol-proceso.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar';
import { RolProceso, RolProcesoDetalle } from '../../models/rol-proceso.model';

@Component({
  selector: 'app-roles-proceso',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './roles-proceso.html',
  styleUrl: './roles-proceso.css'
})
export class RolesProcesoComponent implements OnInit {
  private rolProcesoService = inject(RolProcesoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // ── State ────────────────────────────────────────────────────────
  roles = signal<RolProcesoDetalle[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  vistaDetalle = signal(false);

  // Modal crear/editar
  mostrarModal = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  rolEditandoId = signal<number | null>(null);

  form = signal({ nombre: '', descripcion: '' });

  // Modal confirmación eliminar
  rolAEliminar = signal<RolProcesoDetalle | null>(null);
  eliminando = signal(false);

  private empresaId = 0;
  private usuarioId = 0;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.authService.getUsuario();
    if (!user) { this.router.navigate(['/login']); return; }
    this.empresaId = user.empresaId;
    this.usuarioId = user.id;
    this.cargar();
  }

  cargar() {
    this.isLoading.set(true);
    this.rolProcesoService.listarConDetalle(this.empresaId, this.usuarioId).subscribe({
      next: (data) => { this.roles.set(data); this.isLoading.set(false); },
      error: () => { this.errorMsg.set('No se pudieron cargar los roles.'); this.isLoading.set(false); }
    });
  }

  // ── Modal crear/editar ───────────────────────────────────────────
  abrirCrear() {
    this.modoEdicion.set(false);
    this.rolEditandoId.set(null);
    this.form.set({ nombre: '', descripcion: '' });
    this.mostrarModal.set(true);
  }

  abrirEditar(rol: RolProcesoDetalle) {
    this.modoEdicion.set(true);
    this.rolEditandoId.set(rol.id);
    this.form.set({ nombre: rol.nombre, descripcion: rol.descripcion ?? '' });
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.guardando.set(false);
  }

  guardar() {
    const f = this.form();
    if (!f.nombre.trim()) return;
    this.guardando.set(true);
    this.errorMsg.set('');

    if (this.modoEdicion() && this.rolEditandoId() !== null) {
      // HU-18 — Editar
      this.rolProcesoService.editarRol(this.rolEditandoId()!, {
        nombre: f.nombre.trim(),
        descripcion: f.descripcion.trim(),
        usuarioId: this.usuarioId
      }).subscribe({
        next: () => { this.guardando.set(false); this.cerrarModal(); this.cargar(); },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al editar el rol.');
          this.guardando.set(false);
        }
      });
    } else {
      // HU-17 — Crear
      this.rolProcesoService.crearRol({
        nombre: f.nombre.trim(),
        descripcion: f.descripcion.trim(),
        empresaId: this.empresaId,
        usuarioId: this.usuarioId
      }).subscribe({
        next: () => { this.guardando.set(false); this.cerrarModal(); this.cargar(); },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear el rol.');
          this.guardando.set(false);
        }
      });
    }
  }

  // ── Eliminar ─────────────────────────────────────────────────────
  pedirEliminar(rol: RolProcesoDetalle) { this.rolAEliminar.set(rol); }
  cancelarEliminar() { this.rolAEliminar.set(null); }

  confirmarEliminar() {
    const rol = this.rolAEliminar();
    if (!rol) return;
    this.eliminando.set(true);
    this.rolProcesoService.eliminarRol(rol.id, this.usuarioId).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.rolAEliminar.set(null);
        this.cargar();
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'No se pudo eliminar. Puede que el rol esté en uso.');
        this.eliminando.set(false);
        this.rolAEliminar.set(null);
      }
    });
  }

  totalActividades(rol: RolProcesoDetalle): number {
    return rol.usoEnProcesos?.reduce((acc, p) => acc + (p.actividades?.length ?? 0), 0) ?? 0;
  }

  setFormField(campo: string, valor: any) {
    this.form.update(f => ({ ...f, [campo]: valor }));
  }
}
