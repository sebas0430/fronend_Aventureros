import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PoolService } from '../../services/pool.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar';
import { Pool } from '../../models/pool.model';

@Component({
  selector: 'app-pools',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './pools.html',
  styleUrl: './pools.css',
})
export class PoolsComponent implements OnInit {
  private poolService = inject(PoolService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  pools: Pool[] = [];
  filteredPools: Pool[] = [];
  searchTerm: string = '';
  
  isModalOpen = false;
  isEditMode = false;
  poolForm!: FormGroup;
  currentPoolId: number | null = null;
  empresaId: number | null = null;

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    if (usuario && usuario.empresaId) {
      this.empresaId = usuario.empresaId;
      this.cargarPools();
    }
    
    this.poolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.maxLength(500)]]
    });
  }

  cargarPools(): void {
    if (!this.empresaId) return;
    this.poolService.listarPorEmpresa(this.empresaId).subscribe({
      next: (data) => {
        this.pools = data;
        this.filteredPools = data;
      },
      error: (err) => console.error('Error al cargar pools', err)
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPools = this.pools.filter(pool => 
      pool.nombre.toLowerCase().includes(term) || 
      (pool.descripcion && pool.descripcion.toLowerCase().includes(term))
    );
  }

  openModal(pool?: Pool): void {
    this.isModalOpen = true;
    if (pool) {
      this.isEditMode = true;
      this.currentPoolId = pool.id;
      this.poolForm.patchValue({
        nombre: pool.nombre,
        descripcion: pool.descripcion
      });
    } else {
      this.isEditMode = false;
      this.currentPoolId = null;
      this.poolForm.reset();
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.poolForm.reset();
  }

  guardarPool(): void {
    if (this.poolForm.invalid || !this.empresaId) return;

    const poolData = {
      ...this.poolForm.value,
      empresaId: this.empresaId
    };

    if (this.isEditMode && this.currentPoolId) {
      this.poolService.editarPool(this.currentPoolId, poolData).subscribe({
        next: () => {
          this.cargarPools();
          this.closeModal();
        },
        error: (err) => console.error('Error al editar pool', err)
      });
    } else {
      this.poolService.crearPool(poolData).subscribe({
        next: () => {
          this.cargarPools();
          this.closeModal();
        },
        error: (err) => console.error('Error al crear pool', err)
      });
    }
  }

  eliminarPool(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este Pool? Esta acción no se puede deshacer.')) {
      const usuarioId = this.authService.getUsuario()?.id;
      if (!usuarioId) return;
      
      this.poolService.eliminarPool(id, usuarioId).subscribe({
        next: () => this.cargarPools(),
        error: (err) => console.error('Error al eliminar pool', err)
      });
    }
  }
}
