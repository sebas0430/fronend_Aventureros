import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PoolService } from '../../services/pool.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar';
import { Pool } from '../../models/pool.model';
import { ProcesoService } from '../../services/proceso.service';
import { Proceso } from '../../models/proceso.model';
@Component({
  selector: 'app-pools',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './pools.html',
  styleUrl: './pools.css',
})
export class PoolsComponent implements OnInit {
  private poolService  = inject(PoolService);
  private procesoService = inject(ProcesoService);
  private authService  = inject(AuthService);
  private fb           = inject(FormBuilder);
  private platformId   = inject(PLATFORM_ID);

  // ── Signals ────────────────────────────────────────────────────────────
  private allPools  = signal<Pool[]>([]);
  filteredPools     = signal<Pool[]>([]);
  isModalOpen       = signal(false);
  isEditMode        = signal(false);
  isSaving          = signal(false);
  errorMsg          = signal<string | null>(null);

  isProcesosModalOpen   = signal(false);
  isLoadingProcesos     = signal(false);
  procesosSeleccionados = signal<Proceso[]>([]);
  poolSeleccionadoName  = signal('');

  // ── Estado no reactivo ─────────────────────────────────────────────────
  searchTerm      = '';
  currentPoolId: number | null = null;
  empresaId: number | null = null;
  usuarioId: number | null = null;

  // Formulario inicializado aquí (no en ngOnInit) para evitar race conditions
  poolForm: FormGroup = this.fb.group({
    nombre:      ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    // Solo ejecutar en el navegador (evita problemas con SSR/hydration)
    if (!isPlatformBrowser(this.platformId)) return;

    // Forzar cierre del modal al iniciar (limpia estados de event replay)
    this.isModalOpen.set(false);
    this.isEditMode.set(false);
    this.isSaving.set(false);
    this.poolForm.reset();

    const usuario = this.authService.getUsuario();
    if (usuario) {
      this.empresaId = usuario.empresaId ?? null;
      this.usuarioId = usuario.id ?? null;
      if (this.empresaId) {
        this.cargarPools();
      } else {
        this.errorMsg.set('No se encontró la empresa asociada a tu usuario.');
      }
    } else {
      this.errorMsg.set('No hay sesión activa. Por favor inicia sesión de nuevo.');
    }
  }

  cargarPools(): void {
    if (!this.empresaId) return;
    this.errorMsg.set(null);
    this.poolService.listarPorEmpresa(this.empresaId).subscribe({
      next: (data) => {
        this.allPools.set(data);
        this.filteredPools.set(data);
      },
      error: (err) => {
        console.error('Error al cargar pools', err);
        this.errorMsg.set('No se pudieron cargar los pools. Verifica tu conexión con el servidor.');
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPools.set(
      this.allPools().filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
      )
    );
  }

  openModal(pool?: Pool): void {
    this.poolForm.reset();
    if (pool) {
      this.isEditMode.set(true);
      this.currentPoolId = pool.id;
      this.poolForm.patchValue({ nombre: pool.nombre, descripcion: pool.descripcion });
    } else {
      this.isEditMode.set(false);
      this.currentPoolId = null;
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isSaving.set(false);
    this.isEditMode.set(false);
    this.currentPoolId = null;
    this.poolForm.reset();
  }

  guardarPool(): void {
    if (this.poolForm.invalid || !this.empresaId || !this.usuarioId) return;
    this.isSaving.set(true);

    if (this.isEditMode() && this.currentPoolId) {
      const editData = {
        nombre:      this.poolForm.value.nombre,
        descripcion: this.poolForm.value.descripcion || '',
        usuarioId:   this.usuarioId
      };
      this.poolService.editarPool(this.currentPoolId, editData).subscribe({
        next: () => { this.cargarPools(); this.closeModal(); },
        error: (err) => { console.error('Error al editar pool', err); this.isSaving.set(false); }
      });
    } else {
      const createData = {
        nombre:      this.poolForm.value.nombre,
        descripcion: this.poolForm.value.descripcion || '',
        empresaId:   this.empresaId,
        usuarioId:   this.usuarioId
      };
      this.poolService.crearPool(createData as any).subscribe({
        next: () => { this.cargarPools(); this.closeModal(); },
        error: (err) => { console.error('Error al crear pool', err); this.isSaving.set(false); }
      });
    }
  }

  eliminarPool(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este Pool? Esta acción no se puede deshacer.')) return;
    if (!this.usuarioId) return;
    this.poolService.eliminarPool(id, this.usuarioId).subscribe({
      next: () => this.cargarPools(),
      error: (err) => console.error('Error al eliminar pool', err)
    });
  }

  verProcesos(pool: Pool): void {
    if (!this.usuarioId) return;
    this.poolSeleccionadoName.set(pool.nombre);
    this.isProcesosModalOpen.set(true);
    this.isLoadingProcesos.set(true);
    
    this.procesoService.listarProcesosCompartidosConPool(pool.id, this.usuarioId).subscribe({
      next: (procesos) => {
        this.procesosSeleccionados.set(procesos);
        this.isLoadingProcesos.set(false);
      },
      error: (err) => {
        console.error('Error al cargar procesos del pool', err);
        this.isLoadingProcesos.set(false);
        // Could show a toast or local error here
      }
    });
  }

  cerrarProcesosModal(): void {
    this.isProcesosModalOpen.set(false);
    this.procesosSeleccionados.set([]);
  }
}
