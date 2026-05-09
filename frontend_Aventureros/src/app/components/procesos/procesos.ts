import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProcesoService } from '../../services/proceso.service';
import { EmpresaService } from '../../services/empresa.service';
import { PoolService } from '../../services/pool.service';
import { AuthService } from '../../services/auth.service';
import { Proceso, CrearProcesoRequest, EstadoProceso, PermisoCompartido, ProcesoCompartirDTO } from '../../models/proceso.model';
import { Pool } from '../../models/pool.model';
import { Usuario } from '../../models/usuario.model';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-procesos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './procesos.html',
  styleUrl: './procesos.css'
})
export class ProcesosComponent implements OnInit {
  private procesoService = inject(ProcesoService);
  private empresaService = inject(EmpresaService);
  private poolService = inject(PoolService);
  private authService = inject(AuthService);
  private router = inject(Router);

  procesos = signal<Proceso[]>([]);
  usuarioLogueado = signal<Usuario | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  mostrarModal = signal(false);
  guardando = signal(false);

  filtroEstado = signal<string>('todos');

  form = signal({
    nombre: '',
    descripcion: '',
    categoria: ''
  });

  readonly categorias = [
    'Recursos Humanos', 'Finanzas', 'Operaciones', 'Ventas',
    'TI', 'Legal', 'Marketing', 'Otro'
  ];

  // ── Compartir con Pool ──────────────────────────────────────
  mostrarModalCompartir = signal(false);
  procesoParaCompartir = signal<Proceso | null>(null);
  poolsEmpresa = signal<Pool[]>([]);
  compartirForm = signal({
    poolDestinoId: 0,
    permiso: 'LECTURA' as PermisoCompartido
  });
  compartiendo = signal(false);
  loadingPools = signal(false);

  // ── Confirmación de cambio de estado ────────────────────────
  mostrarConfirmEstado = signal(false);
  procesoConfirmEstado = signal<Proceso | null>(null);
  estadoDestino = signal<EstadoProceso | null>(null);

  ngOnInit() {
    // El AuthGuard ya garantiza que el usuario está autenticado
    const user = this.authService.getUsuario();
    if (!user) return;

    this.usuarioLogueado.set(user);

    this.cargarProcesos(user.empresaId);
  }

  cargarProcesos(empresaId: number) {
    this.isLoading.set(true);
    this.procesoService.listarPorEmpresa(empresaId).subscribe({
      next: (lista) => { this.procesos.set(lista); this.isLoading.set(false); },
      error: () => { this.errorMessage.set('No se pudieron cargar los procesos.'); this.isLoading.set(false); }
    });
  }

  get procesosFiltrados(): Proceso[] {
    const f = this.filtroEstado();
    if (f === 'todos') return this.procesos();
    return this.procesos().filter(p => p.estado === f);
  }

  abrirModal() { this.mostrarModal.set(true); }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.form.set({ nombre: '', descripcion: '', categoria: '' });
  }

  campoForm(campo: 'nombre' | 'descripcion' | 'categoria', valor: string) {
    this.form.update(f => ({ ...f, [campo]: valor }));
  }

  crearProceso() {
    const f = this.form();
    if (!f.nombre.trim() || !f.descripcion.trim() || !f.categoria) return;

    const user = this.usuarioLogueado()!;
    const dto: CrearProcesoRequest = {
      nombre: f.nombre.trim(),
      descripcion: f.descripcion.trim(),
      categoria: f.categoria,
      empresaId: user.empresaId,
      autorId: user.id
    };

    this.guardando.set(true);
    this.errorMessage.set('');
    this.procesoService.crearProceso(dto).subscribe({
      next: (nuevo) => {
        this.procesos.update(lista => [nuevo, ...lista]);
        this.guardando.set(false);
        this.cerrarModal();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error
          || 'No se pudo crear el proceso. Verifica que tu usuario tenga rol ADMINISTRADOR_EMPRESA y que la empresa tenga un Pool configurado.';
        this.errorMessage.set(typeof msg === 'string' ? msg : JSON.stringify(msg));
        this.guardando.set(false);
      }
    });
  }

  abrirEditor(proceso: Proceso) {
    this.router.navigate(['/editor', proceso.id]);
  }

  // ── Cambio de Estado ────────────────────────────────────────
  solicitarCambioEstado(proceso: Proceso, nuevoEstado: EstadoProceso) {
    this.procesoConfirmEstado.set(proceso);
    this.estadoDestino.set(nuevoEstado);
    this.mostrarConfirmEstado.set(true);
  }

  cerrarConfirmEstado() {
    this.mostrarConfirmEstado.set(false);
    this.procesoConfirmEstado.set(null);
    this.estadoDestino.set(null);
  }

  confirmarCambioEstado() {
    const proceso = this.procesoConfirmEstado();
    const nuevoEstado = this.estadoDestino();
    const user = this.usuarioLogueado();
    if (!proceso || !nuevoEstado || !user) return;

    this.guardando.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.procesoService.cambiarEstado(proceso.id, nuevoEstado, user.id).subscribe({
      next: (actualizado) => {
        // Actualizar el proceso en la lista local
        this.procesos.update(lista =>
          lista.map(p => p.id === proceso.id ? { ...p, estado: nuevoEstado } : p)
        );
        this.guardando.set(false);
        this.cerrarConfirmEstado();
        this.mostrarExito(`Proceso "${proceso.nombre}" cambiado a ${nuevoEstado}`);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error
          || `No se pudo cambiar el estado a ${nuevoEstado}. Verifica tus permisos.`;
        this.errorMessage.set(typeof msg === 'string' ? msg : JSON.stringify(msg));
        this.guardando.set(false);
        this.cerrarConfirmEstado();
      }
    });
  }

  getEstadoDestinoLabel(): string {
    const e = this.estadoDestino();
    if (e === 'PUBLICADO') return '✅ Publicar';
    if (e === 'INACTIVO') return '🔒 Inhabilitar';
    if (e === 'BORRADOR') return '✏️ Volver a Borrador';
    return '';
  }

  getEstadoDestinoDescripcion(): string {
    const e = this.estadoDestino();
    if (e === 'PUBLICADO') return 'El proceso será visible y vinculable a los Pools. No podrá editarse hasta que se vuelva a Borrador.';
    if (e === 'INACTIVO') return 'El proceso dejará de estar disponible para nuevos pools, pero se conservará su trazabilidad.';
    if (e === 'BORRADOR') return 'El proceso volverá a ser editable pero dejará de estar visible para los Pools.';
    return '';
  }

  // ── Compartir con Pool ──────────────────────────────────────
  abrirModalCompartir(proceso: Proceso) {
    this.procesoParaCompartir.set(proceso);
    this.compartirForm.set({ poolDestinoId: 0, permiso: 'LECTURA' });
    this.mostrarModalCompartir.set(true);
    this.cargarPoolsEmpresa();
  }

  cerrarModalCompartir() {
    this.mostrarModalCompartir.set(false);
    this.procesoParaCompartir.set(null);
  }

  cargarPoolsEmpresa() {
    const user = this.usuarioLogueado();
    if (!user) return;

    this.loadingPools.set(true);
    this.poolService.listarPorEmpresa(user.empresaId).subscribe({
      next: (pools) => {
        this.poolsEmpresa.set(pools);
        this.loadingPools.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los Pools de la empresa.');
        this.loadingPools.set(false);
      }
    });
  }

  campoCompartir(campo: 'poolDestinoId' | 'permiso', valor: string) {
    if (campo === 'poolDestinoId') {
      this.compartirForm.update(f => ({ ...f, poolDestinoId: parseInt(valor, 10) }));
    } else {
      this.compartirForm.update(f => ({ ...f, permiso: valor as PermisoCompartido }));
    }
  }

  compartirProceso() {
    const proceso = this.procesoParaCompartir();
    const form = this.compartirForm();
    const user = this.usuarioLogueado();
    if (!proceso || !form.poolDestinoId || !user) return;

    const dto: ProcesoCompartirDTO = {
      poolDestinoId: form.poolDestinoId,
      permiso: form.permiso,
      usuarioId: user.id
    };

    this.compartiendo.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.procesoService.compartirProceso(proceso.id, dto).subscribe({
      next: () => {
        this.compartiendo.set(false);
        this.cerrarModalCompartir();
        const poolNombre = this.poolsEmpresa().find(p => p.id === form.poolDestinoId)?.nombre || 'Pool';
        this.mostrarExito(`Proceso "${proceso.nombre}" compartido con ${poolNombre}`);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error
          || 'No se pudo compartir el proceso. Verifica tus permisos.';
        this.errorMessage.set(typeof msg === 'string' ? msg : JSON.stringify(msg));
        this.compartiendo.set(false);
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────
  mostrarExito(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  getEstadoColor(estado: EstadoProceso): string {
    return { BORRADOR: 'estado-borrador', PUBLICADO: 'estado-publicado', INACTIVO: 'estado-inactivo' }[estado] ?? '';
  }

  getEstadoIcon(estado: EstadoProceso): string {
    return { BORRADOR: '✏️', PUBLICADO: '✅', INACTIVO: '🔒' }[estado] ?? '';
  }

  getInitials(correo: string): string {
    return correo.substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
