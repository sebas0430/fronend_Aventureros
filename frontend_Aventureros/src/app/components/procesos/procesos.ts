import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProcesoService } from '../../services/proceso.service';
import { EmpresaService } from '../../services/empresa.service';
import { AuthService } from '../../services/auth.service';
import { Proceso, CrearProcesoRequest, EstadoProceso } from '../../models/proceso.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-procesos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './procesos.html',
  styleUrl: './procesos.css'
})
export class ProcesosComponent implements OnInit {
  private procesoService = inject(ProcesoService);
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  procesos = signal<Proceso[]>([]);
  usuarioLogueado = signal<Usuario | null>(null);
  nombreEmpresa = signal('Cargando...');
  isLoading = signal(true);
  errorMessage = signal('');
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

  ngOnInit() {
    // El AuthGuard ya garantiza que el usuario está autenticado
    const user = this.authService.getUsuario();
    if (!user) return;

    this.usuarioLogueado.set(user);

    this.empresaService.obtenerEmpresa(user.empresaId).subscribe({
      next: (e) => this.nombreEmpresa.set(e.nombre),
      error: () => this.nombreEmpresa.set('Mi Empresa')
    });

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
