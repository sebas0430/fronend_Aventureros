import { Component, EventEmitter, Input, OnInit, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuario.model';
import { Pool } from '../../models/pool.model';
import { RolPool } from '../../models/rol-pool.model';
import { PoolService } from '../../services/pool.service';
import { RolPoolService } from '../../services/rol-pool.service';

@Component({
  selector: 'app-asignar-pool',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignar-pool.html',
  styleUrl: './asignar-pool.css'
})
export class AsignarPoolComponent implements OnInit {
  @Input({ required: true }) usuarioDestino!: Usuario;
  @Input({ required: true }) usuarioAdminId!: number; // Quien asigna
  @Output() cerrar = new EventEmitter<void>();
  @Output() asignacionExitosa = new EventEmitter<void>();

  private poolService = inject(PoolService);
  private rolPoolService = inject(RolPoolService);

  pools = signal<Pool[]>([]);
  rolesPool = signal<RolPool[]>([]);
  
  poolIdSeleccionado = signal<number | null>(null);
  rolIdSeleccionado = signal<number | null>(null);

  isLoadingPools = signal(true);
  isLoadingRoles = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.cargarPools();
  }

  cargarPools() {
    this.isLoadingPools.set(true);
    this.poolService.listarPorEmpresa(this.usuarioDestino.empresaId).subscribe({
      next: (data) => {
        this.pools.set(data);
        this.isLoadingPools.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los departamentos (Pools).');
        this.isLoadingPools.set(false);
      }
    });
  }

  onPoolChange(poolIdStr: string) {
    const poolId = parseInt(poolIdStr, 10);
    if (!poolId) return;
    
    this.poolIdSeleccionado.set(poolId);
    this.rolIdSeleccionado.set(null); // Reset
    
    this.isLoadingRoles.set(true);
    this.rolPoolService.listarRolesPorPool(poolId, this.usuarioAdminId).subscribe({
      next: (data) => {
        this.rolesPool.set(data);
        this.isLoadingRoles.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los roles de este departamento.');
        this.isLoadingRoles.set(false);
      }
    });
  }

  guardar() {
    const poolId = this.poolIdSeleccionado();
    const rolId = this.rolIdSeleccionado();
    if (!poolId || !rolId) {
      this.errorMessage.set('Selecciona un departamento y un rol.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.rolPoolService.asignarRol({
      usuarioDestinoId: this.usuarioDestino.id,
      poolId: poolId,
      rolPoolId: rolId,
      usuarioId: this.usuarioAdminId
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.asignacionExitosa.emit();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Error al asignar el rol en el departamento.');
        this.isSaving.set(false);
      }
    });
  }
}
