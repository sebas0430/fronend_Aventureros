import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);

  onSubmit() {
    if (!this.correo() || !this.password()) {
      this.errorMessage.set('Por favor, completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ correo: this.correo(), password: this.password() }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        // Guardar información del usuario si es necesario (localStorage/SessionStorage)
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('usuario', JSON.stringify(response));
        }
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
