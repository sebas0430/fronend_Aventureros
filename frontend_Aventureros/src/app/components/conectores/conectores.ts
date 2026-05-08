import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificacionExternaService } from '../../services/notificacion-externa.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar';
import { ConectorExterno, EnvioExterno, NotificacionExterna, TipoConectorExterno } from '../../models/conector-externo.model';

/** HU-26 — Conectores externos y envío de notificaciones */
@Component({
  selector: 'app-conectores',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './conectores.html',
  styleUrl: './conectores.css'
})
export class ConectoresComponent implements OnInit {
  private svc = inject(NotificacionExternaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  conectores = signal<ConectorExterno[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  mostrarModal = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  conectorEditandoId = signal<number | null>(null);
  conectorAEliminar = signal<ConectorExterno | null>(null);
  eliminando = signal(false);

  // Modal enviar
  mostrarEnvio = signal(false);
  enviando = signal(false);
  conectorEnvio = signal<ConectorExterno | null>(null);
  formEnvio = signal({ procesoId: '', payload: '{}' });
  resultadoEnvio = signal<NotificacionExterna | null>(null);

  readonly tiposConector: TipoConectorExterno[] = ['EMAIL', 'WEBHOOK', 'QUEUE'];

  form = signal<Partial<ConectorExterno>>({
    nombre: '', tipo: 'WEBHOOK', destino: '', maxReintentos: 3,
    credencialRef: '', usuarioAuth: '', headersJson: ''
  });

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
    this.svc.listarConectores(this.empresaId).subscribe({
      next: (d) => { this.conectores.set(d); this.isLoading.set(false); },
      error: () => { this.errorMsg.set('No se pudieron cargar los conectores.'); this.isLoading.set(false); }
    });
  }

  abrirCrear() {
    this.modoEdicion.set(false); this.conectorEditandoId.set(null);
    this.form.set({ nombre: '', tipo: 'WEBHOOK', destino: '', maxReintentos: 3, credencialRef: '', usuarioAuth: '', headersJson: '' });
    this.mostrarModal.set(true);
  }

  abrirEditar(c: ConectorExterno) {
    this.modoEdicion.set(true); this.conectorEditandoId.set(c.id ?? null);
    this.form.set({ ...c });
    this.mostrarModal.set(true);
  }

  cerrarModal() { this.mostrarModal.set(false); this.guardando.set(false); }

  guardar() {
    const f = this.form();
    if (!f.nombre?.trim() || !f.destino?.trim()) return;
    this.guardando.set(true);
    const dto: ConectorExterno = { ...f as ConectorExterno, empresaId: this.empresaId, usuarioId: this.usuarioId };

    const obs = this.modoEdicion() && this.conectorEditandoId() !== null
      ? this.svc.editarConector(this.conectorEditandoId()!, dto)
      : this.svc.crearConector(dto);

    obs.subscribe({
      next: () => { this.guardando.set(false); this.cerrarModal(); this.cargar(); },
      error: (err) => { this.errorMsg.set(err?.error?.message || 'Error al guardar.'); this.guardando.set(false); }
    });
  }

  pedirEliminar(c: ConectorExterno) { this.conectorAEliminar.set(c); }
  cancelarEliminar() { this.conectorAEliminar.set(null); }
  confirmarEliminar() {
    const c = this.conectorAEliminar();
    if (!c) return;
    this.eliminando.set(true);
    this.svc.eliminarConector(c.id!, this.usuarioId).subscribe({
      next: () => { this.eliminando.set(false); this.conectorAEliminar.set(null); this.cargar(); },
      error: (err) => { this.errorMsg.set(err?.error?.message || 'Error al eliminar.'); this.eliminando.set(false); this.conectorAEliminar.set(null); }
    });
  }

  abrirEnvio(c: ConectorExterno) { this.conectorEnvio.set(c); this.formEnvio.set({ procesoId: '', payload: '{}' }); this.resultadoEnvio.set(null); this.mostrarEnvio.set(true); }
  cerrarEnvio() { this.mostrarEnvio.set(false); this.enviando.set(false); }

  enviar() {
    const c = this.conectorEnvio();
    if (!c) return;
    this.enviando.set(true);
    const dto: EnvioExterno = { conectorId: c.id!, procesoId: Number(this.formEnvio().procesoId), payload: this.formEnvio().payload, usuarioId: this.usuarioId };
    this.svc.enviarMensaje(dto).subscribe({
      next: (res) => { this.resultadoEnvio.set(res); this.enviando.set(false); },
      error: (err) => { this.errorMsg.set(err?.error?.message || 'Error al enviar.'); this.enviando.set(false); }
    });
  }

  getTipoIcon(tipo: string): string {
    return { EMAIL: '📧', WEBHOOK: '🔗', QUEUE: '📨' }[tipo] ?? '📡';
  }

  setFormField(campo: string, valor: any) {
    this.form.update(f => ({ ...f, [campo]: valor }));
  }
}
