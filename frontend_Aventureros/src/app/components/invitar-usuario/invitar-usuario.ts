import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-invitar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitar-usuario.html',
  styleUrl: './invitar-usuario.css'
})
export class InvitarUsuarioComponent {
  private usuarioService = inject(UsuarioService);

  /** ID de la empresa del admin logueado */
  empresaId = input.required<number>();

  /** Evento emitido cuando la invitación fue exitosa */
  invitacionExitosa = output<void>();

  /** Evento para cerrar el modal */
  cerrar = output<void>();

  correo   = '';
  rol      = 'SOLO_LECTURA';
  password = '';

  isLoading = false;
  errorMsg  = '';
  successMsg = '';

  onCerrar() {
    this.cerrar.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onCerrar();
    }
  }

  onSubmit() {
    if (!this.correo || !this.password || !this.rol) {
      this.errorMsg = 'Todos los campos son obligatorios.';
      return;
    }

    this.isLoading = true;
    this.errorMsg  = '';
    this.successMsg = '';

    this.usuarioService.invitarPorCorreo(
      this.correo,
      this.empresaId(),
      this.rol,
      this.password
    ).subscribe({
      next: () => {
        this.successMsg = `✅ ${this.correo} ha sido invitado exitosamente.`;
        this.isLoading  = false;
        this.correo     = '';
        this.password   = '';
        this.rol        = 'SOLO_LECTURA';
        this.invitacionExitosa.emit();
      },
      error: (err) => {
        console.error('Error al invitar:', err);
        this.errorMsg  = err?.error?.message ?? 'No se pudo enviar la invitación. Intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }
}
