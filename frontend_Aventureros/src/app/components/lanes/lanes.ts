import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LaneService } from '../../services/lane.service';
import { PoolService } from '../../services/pool.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar';
import { Pool } from '../../models/pool.model';
import { Lane } from '../../models/lane.model';

/** HU-22 — Gestión de Lanes (Swimlanes) dentro de cada Pool */
@Component({
  selector: 'app-lanes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './lanes.html',
  styleUrl: './lanes.css'
})
export class LanesComponent implements OnInit {
  private laneService = inject(LaneService);
  private poolService = inject(PoolService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  pools = signal<Pool[]>([]);
  lanes = signal<Lane[]>([]);
  poolSeleccionado = signal<Pool | null>(null);

  isLoadingPools = signal(true);
  isLoadingLanes = signal(false);
  errorMsg = signal('');

  mostrarModal = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  laneEditandoId = signal<number | null>(null);
  laneAEliminar = signal<Lane | null>(null);
  eliminando = signal(false);

  form = signal({ nombre: '', descripcion: '' });

  private usuarioId = 0;
  private empresaId = 0;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.authService.getUsuario();
    if (!user) { this.router.navigate(['/login']); return; }
    this.usuarioId = user.id;
    this.empresaId = user.empresaId;
    this.cargarPools();
  }

  cargarPools() {
    this.isLoadingPools.set(true);
    this.poolService.listarPorEmpresa(this.empresaId).subscribe({
      next: (data) => { this.pools.set(data); this.isLoadingPools.set(false); },
      error: () => { this.errorMsg.set('No se pudieron cargar los pools.'); this.isLoadingPools.set(false); }
    });
  }

  seleccionarPool(pool: Pool) {
    this.poolSeleccionado.set(pool);
    this.isLoadingLanes.set(true);
    this.laneService.listarPorPool(pool.id!, this.usuarioId).subscribe({
      next: (data) => { this.lanes.set(data); this.isLoadingLanes.set(false); },
      error: () => { this.errorMsg.set('No se pudieron cargar los lanes.'); this.isLoadingLanes.set(false); }
    });
  }

  abrirCrear() {
    this.modoEdicion.set(false);
    this.laneEditandoId.set(null);
    this.form.set({ nombre: '', descripcion: '' });
    this.mostrarModal.set(true);
  }

  abrirEditar(lane: Lane) {
    this.modoEdicion.set(true);
    this.laneEditandoId.set(lane.id ?? null);
    this.form.set({ nombre: lane.nombre, descripcion: lane.descripcion ?? '' });
    this.mostrarModal.set(true);
  }

  cerrarModal() { this.mostrarModal.set(false); this.guardando.set(false); }

  guardar() {
    const pool = this.poolSeleccionado();
    if (!pool || !this.form().nombre.trim()) return;
    this.guardando.set(true);
    this.errorMsg.set('');

    if (this.modoEdicion() && this.laneEditandoId() !== null) {
      this.laneService.editarLane(this.laneEditandoId()!, {
        nombre: this.form().nombre.trim(),
        descripcion: this.form().descripcion.trim(),
        usuarioId: this.usuarioId
      }).subscribe({
        next: () => { this.guardando.set(false); this.cerrarModal(); this.seleccionarPool(pool); },
        error: (err) => { this.errorMsg.set(err?.error?.message || 'Error al editar.'); this.guardando.set(false); }
      });
    } else {
      this.laneService.crearLane({
        nombre: this.form().nombre.trim(),
        descripcion: this.form().descripcion.trim(),
        poolId: pool.id!,
        usuarioId: this.usuarioId
      }).subscribe({
        next: () => { this.guardando.set(false); this.cerrarModal(); this.seleccionarPool(pool); },
        error: (err) => { this.errorMsg.set(err?.error?.message || 'Error al crear.'); this.guardando.set(false); }
      });
    }
  }

  pedirEliminar(lane: Lane) { this.laneAEliminar.set(lane); }
  cancelarEliminar() { this.laneAEliminar.set(null); }

  confirmarEliminar() {
    const lane = this.laneAEliminar();
    const pool = this.poolSeleccionado();
    if (!lane || !pool) return;
    this.eliminando.set(true);
    this.laneService.eliminarLane(lane.id!, this.usuarioId).subscribe({
      next: () => { this.eliminando.set(false); this.laneAEliminar.set(null); this.seleccionarPool(pool); },
      error: (err) => { this.errorMsg.set(err?.error?.message || 'Error al eliminar.'); this.eliminando.set(false); this.laneAEliminar.set(null); }
    });
  }

  setFormField(campo: string, valor: any) {
    this.form.update(f => ({ ...f, [campo]: valor }));
  }
}
