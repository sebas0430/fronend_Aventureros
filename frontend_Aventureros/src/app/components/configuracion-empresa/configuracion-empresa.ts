import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { EmpresaService } from '../../services/empresa.service';

@Component({
  selector: 'app-configuracion-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion-empresa.html',
  styleUrls: ['./configuracion-empresa.css']
})
export class ConfiguracionEmpresa implements OnInit {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService
  ) {

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      nit: ['', Validators.required]
    });

  }

  ngOnInit(): void {

    const empresaId = localStorage.getItem('empresaId');

    if (empresaId) {

      this.empresaService.obtenerEmpresa(Number(empresaId))
        .subscribe(data => {

          this.form.patchValue(data);

        });

    }

  }

  actualizar(): void {

    const empresaId = localStorage.getItem('empresaId');

    if (empresaId) {

      this.empresaService.editarEmpresa(
        Number(empresaId),
        this.form.value
      ).subscribe(() => {

        alert('Empresa actualizada');

      });

    }

  }

}