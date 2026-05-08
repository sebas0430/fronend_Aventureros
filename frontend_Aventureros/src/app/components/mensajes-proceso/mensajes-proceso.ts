import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { ProcesoService } from '../../services/proceso.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar';
import { Proceso } from '../../models/proceso.model';
import { EventoMensaje, MensajeEjecucion, TipoEventoMensaje } from '../../models/evento-mensaje.model';

/** HU-25/27/28 — Message Throw, Message Catch y trazabilidad de mensajes */
@Component({
  selector: 'app-mensajes-proceso',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './mensajes-proceso.html',
  styleUrl: './mensajes-proceso.css'
})
export class MensajesProcesoComponent implements OnInit {
  private eventoSvc = inject(EventoMensajeService);
  private procesoSvc = inject(ProcesoService);
  private authSvc = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  procesos = signal<Proceso[]>([]);
  procesoSeleccionado = signal<Proceso | null>(null);
  eventos = signal<EventoMensaje[]>([]);
  logs = signal<MensajeEjecucion[]>([]);
  catchLogs = signal<any[]>([]);

  isLoadingProcesos = signal(true);
  isLoadingEventos = signal(false);
  errorMsg = signal('');

  mostrarModal = signal(false);
  guardando = signal(false);
  mostrarLanzar = signal(false);
  lanzando = signal(false);
  eventoParaLanzar = signal<EventoMensaje | null>(null);
  lanzarPayload = signal('{}');
  resultadoLanzamiento = signal<MensajeEjecucion[] | null>(null);

  form = signal<Partial<EventoMensaje>>({ nombreMensaje: '', tipo: 'THROW', payloadSchema: '', fallback: 'ERROR' });

  private empresaId = 0;
  private usuarioId = 0;

  readonly tipos: TipoEventoMensaje[] = ['THROW', 'CATCH'];
  readonly fallbacks = ['GUARDAR', 'REINTENTAR', 'ERROR'];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.authSvc.getUsuario();
    if (!user) { this.router.navigate(['/login']); return; }
    this.empresaId = user.empresaId;
    this.usuarioId = user.id;
    this.procesoSvc.listarPorEmpresa(this.empresaId).subscribe({
      next: (p) => { this.procesos.set(p); this.isLoadingProcesos.set(false); },
      error: () => { this.errorMsg.set('Error cargando procesos.'); this.isLoadingProcesos.set(false); }
    });
  }

  seleccionarProceso(p: Proceso) {
    this.procesoSeleccionado.set(p);
    this.isLoadingEventos.set(true);
    this.eventoSvc.listarPorProceso(p.id).subscribe({
      next: (ev) => { this.eventos.set(ev); this.isLoadingEventos.set(false); this.cargarCatchLogs(p.id); },
      error: () => { this.errorMsg.set('Error cargando eventos.'); this.isLoadingEventos.set(false); }
    });
  }

  cargarCatchLogs(procesoId: number) {
    this.eventoSvc.logsPorProceso(procesoId).subscribe({ next: (l) => this.catchLogs.set(l), error: () => {} });
  }

  abrirCrear() {
    this.form.set({ nombreMensaje: '', tipo: 'THROW', payloadSchema: '', fallback: 'ERROR' });
    this.mostrarModal.set(true);
  }
  cerrarModal() { this.mostrarModal.set(false); this.guardando.set(false); }

  guardar() {
    const p = this.procesoSeleccionado();
    if (!p || !this.form().nombreMensaje?.trim()) return;
    this.guardando.set(true);
    this.eventoSvc.crearEvento({ ...this.form() as EventoMensaje, procesoId: p.id, usuarioId: this.usuarioId }).subscribe({
      next: () => { this.guardando.set(false); this.cerrarModal(); this.seleccionarProceso(p); },
      error: (err) => { this.errorMsg.set(err?.error?.message || 'Error al crear.'); this.guardando.set(false); }
    });
  }

  abrirLanzar(ev: EventoMensaje) { this.eventoParaLanzar.set(ev); this.lanzarPayload.set('{}'); this.resultadoLanzamiento.set(null); this.mostrarLanzar.set(true); }
  cerrarLanzar() { this.mostrarLanzar.set(false); this.lanzando.set(false); }

  lanzarMensaje() {
    const ev = this.eventoParaLanzar();
    if (!ev?.id) return;
    this.lanzando.set(true);
    this.eventoSvc.lanzarMensaje({ eventoOrigenId: ev.id, payload: this.lanzarPayload(), usuarioId: this.usuarioId }).subscribe({
      next: (res) => { this.resultadoLanzamiento.set(res); this.lanzando.set(false); },
      error: (err) => { this.errorMsg.set(err?.error?.message || 'Error al lanzar.'); this.lanzando.set(false); }
    });
  }

  eliminarEvento(ev: EventoMensaje) {
    const p = this.procesoSeleccionado();
    if (!p || !ev.id) return;
    if (!confirm(`¿Eliminar el evento "${ev.nombreMensaje}"?`)) return;
    this.eventoSvc.eliminarEvento(ev.id, this.usuarioId).subscribe({
      next: () => this.seleccionarProceso(p),
      error: (err) => this.errorMsg.set(err?.error?.message || 'Error al eliminar.')
    });
  }

  getTipoColor(tipo: string): string { return tipo === 'THROW' ? 'badge-throw' : 'badge-catch'; }
  setFormField(campo: string, valor: any) { this.form.update(f => ({ ...f, [campo]: valor })); }
}
