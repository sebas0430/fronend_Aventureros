import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario.model';
import { Pool } from '../../models/pool.model';
import { RolPool } from '../../models/rol-pool.model';

@Component({
  selector: 'app-empleado-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empleado-card.html',
  styleUrl: './empleado-card.css'
})
export class EmpleadoCardComponent {
  @Input({ required: true }) emp!: Usuario;
  @Input() usuarioLogueado: Usuario | null = null;
  @Input() asignaciones: { pool: Pool, rol: RolPool }[] = [];

  @Output() removerPool = new EventEmitter<{pool: Pool, rol: RolPool}>();
  @Output() asignarRol = new EventEmitter<void>();
  @Output() verDetalle = new EventEmitter<void>();
  @Output() toggleActivo = new EventEmitter<void>();
  @Output() eliminarEmpleado = new EventEmitter<void>();

  getInitials(correo: string): string {
    return correo ? correo.substring(0, 2).toUpperCase() : '';
  }

  getRolBadgeClass(rol: string): string {
    const rolUpper = rol?.toUpperCase() || '';
    if (rolUpper === 'ADMINISTRADOR_EMPRESA') return 'badge-admin';
    if (rolUpper === 'EDITOR') return 'badge-editor';
    if (rolUpper === 'SOLO_LECTURA' || rolUpper === 'LECTOR') return 'badge-lector';
    return 'badge-lector';
  }

  getRolGlobal(rol: string): string {
    const map: Record<string, string> = {
      'ADMINISTRADOR_EMPRESA': 'Administrador',
      'EDITOR': 'Editor',
      'SOLO_LECTURA': 'Lector',
      'LECTOR': 'Lector'
    };
    return map[rol?.toUpperCase()] || rol;
  }
}
