import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service';
@Component({
  selector: 'app-registro-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-empresa.html',
  styleUrls: ['./registro-empresa.css']
})
export class RegistroEmpresa {

  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      nit: ['', Validators.required],
      correoContacto: ['', [Validators.required, Validators.email]],
      passwordAdmin: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }
  registrar() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (
      this.form.value.passwordAdmin !==
      this.form.value.confirmPassword
    ) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    this.loading = true;

    const payload = {
      nombre: this.form.value.nombre,
      nit: this.form.value.nit,
      correoContacto: this.form.value.correoContacto,
      passwordAdmin: this.form.value.passwordAdmin
    };
    this.empresaService.registrarEmpresa(payload)
      .subscribe({
        next: () => {
          alert('Empresa creada correctamente');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Error creando empresa';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}