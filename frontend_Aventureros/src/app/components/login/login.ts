import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  correo = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    if (!this.correo() || !this.password()) {
      this.errorMessage.set('Por favor, completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ correo: this.correo(), password: this.password() }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/empleados']); // Redirigir al dashboard de empleados
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage.set('Correo o contraseña incorrectos.');
        this.isLoading.set(false);
      }
    });
  }
}
