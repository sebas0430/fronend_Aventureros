import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActividadService } from '../../services/actividad.service';
import { AuthService } from '../../services/auth.service';
import { ProcesoService } from '../../services/proceso.service';
import { ActividadRegistroDTO, ActividadEdicionDTO, RolGlobal } from '../../models/actividad.model';
import { Proceso } from '../../models/proceso.model';
import { Usuario } from '../../models/usuario.model';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './actividades.html',
  styleUrl: './actividades.css'
})
export class ActividadesComponent implements OnInit {
  private actividadService = inject(ActividadService);
  private procesoService = inject(ProcesoService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  proceso = signal<Proceso | null>(null);
  actividades = signal<ActividadRegistroDTO[]>([]);
  usuarioLogueado = signal<Usuario | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  
  mostrarModal = signal(false);
  modoEdicion = signal(false);
  actividadSeleccionadaId = signal<number | null>(null);
  guardando = signal(false);

  form = signal({
    nombre: '',
    tipoActividad: 'TASK',
    descripcion: '',
    rolResponsable: RolGlobal.EDITOR,
    orden: 0
  });

  rolesGlobales = Object.values(RolGlobal);
  tiposActividad = ['TASK', 'SERVICE', 'USER', 'MANUAL'];

  ngOnInit() {
    const user = this.authService.getUsuario();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioLogueado.set(user);

    const procesoId = Number(this.route.snapshot.paramMap.get('id'));
    if (procesoId) {
      this.cargarProceso(procesoId);
      this.cargarActividades(procesoId);
    } else {
      this.router.navigate(['/procesos']);
    }
  }

  cargarProceso(id: number) {
    this.procesoService.obtenerProceso(id).subscribe({
      next: (p) => this.proceso.set(p),
      error: () => this.errorMessage.set('No se pudo cargar la información del proceso.')
    });
  }

  cargarActividades(procesoId: number) {
    this.isLoading.set(true);
    this.actividadService.listarPorProceso(procesoId).subscribe({
      next: (lista) => {
        this.actividades.set(lista);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las actividades.');
        this.isLoading.set(false);
      }
    });
  }

  abrirCrear() {
    this.modoEdicion.set(false);
    this.actividadSeleccionadaId.set(null);
    this.form.set({
      nombre: '',
      tipoActividad: 'TASK',
      descripcion: '',
      rolResponsable: RolGlobal.EDITOR,
      orden: this.actividades().length + 1
    });
    this.mostrarModal.set(true);
  }

  abrirEditar(actividad: ActividadRegistroDTO) {
    if (!actividad.id) return;
    this.modoEdicion.set(true);
    this.actividadSeleccionadaId.set(actividad.id);
    this.form.set({
      nombre: actividad.nombre,
      tipoActividad: actividad.tipoActividad,
      descripcion: actividad.descripcion,
      rolResponsable: actividad.rolResponsable,
      orden: actividad.orden || 0
    });
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.errorMessage.set('');
    this.actividadSeleccionadaId.set(null);
  }

  setFormField(campo: string, valor: any) {
    this.form.update(f => ({ ...f, [campo]: valor }));
  }

  guardar() {
    const f = this.form();
    const user = this.usuarioLogueado()!;
    const proceso = this.proceso()!;

    if (!f.nombre.trim() || !f.descripcion.trim()) return;

    this.guardando.set(true);
    if (this.modoEdicion() && this.actividadSeleccionadaId()) {
      const dto: ActividadEdicionDTO = {
        ...f,
        usuarioId: user.id
      };
      this.actividadService.editarActividad(this.actividadSeleccionadaId()!, dto).subscribe({
        next: (actualizada) => {
          this.actividades.update(list => list.map(a => 
            a.id === actualizada.id ? { ...a, ...actualizada } : a
          ));
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarExito('Actividad actualizada');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error al actualizar');
          this.guardando.set(false);
        }
      });
    } else {
      const dto: ActividadRegistroDTO = {
        ...f,
        procesoId: proceso.id,
        usuarioId: user.id
      };

      this.actividadService.crearActividad(dto).subscribe({
        next: (nueva) => {
          this.actividades.update(list => [...list, nueva]);
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarExito('Actividad creada con éxito');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error al crear actividad');
          this.guardando.set(false);
        }
      });
    }
  }

  eliminar(actividad: ActividadRegistroDTO) {
    if (!actividad.id || !confirm(`¿Eliminar actividad "${actividad.nombre}"?`)) return;
    
    const user = this.usuarioLogueado()!;
    this.actividadService.eliminarActividad(actividad.id, user.id).subscribe({
      next: () => {
        this.actividades.update(list => list.filter(a => a.id !== actividad.id));
        this.mostrarExito('Actividad eliminada');
        // Recargar para ver los nuevos órdenes (el backend reajusta el orden)
        this.cargarActividades(this.proceso()!.id);
      },
      error: (err) => {
        alert(err.error?.message || 'Error al eliminar');
      }
    });
  }

  mostrarExito(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  volverProcesos() {
    this.router.navigate(['/procesos']);
  }
}
