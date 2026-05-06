import { Component, EventEmitter, Input, OnInit, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario.model';
import { Proceso } from '../../models/proceso.model';
import { Pool } from '../../models/pool.model';
import { RolPool, AsignacionRolDTO } from '../../models/rol-pool.model';
import { UsuarioService } from '../../services/usuario.service';
import { ProcesoService } from '../../services/proceso.service';
import { PoolService } from '../../services/pool.service';
import { RolPoolService } from '../../services/rol-pool.service';

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.css'
})
export class UsuarioDetalleComponent implements OnInit {
  @Input({ required: true }) usuarioId!: number;
  @Output() cerrar = new EventEmitter<void>();

  private usuarioService = inject(UsuarioService);
  private procesoService = inject(ProcesoService);
  private poolService = inject(PoolService);
  private rolPoolService = inject(RolPoolService);

  usuario = signal<Usuario | null>(null);
  procesos = signal<Proceso[]>([]);
  poolsAsignados = signal<{ pool: Pool, asignacion: AsignacionRolDTO }[]>([]);
  
  isLoading = signal(true);
  isLoadingExtras = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.usuarioService.obtenerUsuario(this.usuarioId).subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.isLoading.set(false);
        this.cargarExtras(data);
      },
      error: (err) => {
        console.error('Error al cargar detalle de usuario:', err);
        this.errorMessage.set('No se pudo cargar la información del usuario.');
        this.isLoading.set(false);
      }
    });
  }

  cargarExtras(user: Usuario) {
    this.isLoadingExtras.set(true);
    
    // 1. Cargar procesos
    this.procesoService.listarPorAutor(user.id).subscribe({
      next: (procesos) => this.procesos.set(procesos)
    });

    // 2. Buscar pools (N+1 approach for frontend simplicity since backend lacks endpoint)
    this.poolService.listarPorEmpresa(user.empresaId).subscribe({
      next: (pools) => {
        const asignaciones: { pool: Pool, asignacion: AsignacionRolDTO }[] = [];
        let pending = pools.length;
        if (pending === 0) this.isLoadingExtras.set(false);
        
        pools.forEach(pool => {
          this.rolPoolService.obtenerRolDeUsuario(user.id, pool.id).subscribe({
            next: (asign) => {
              if (asign) {
                asignaciones.push({ pool, asignacion: asign });
              }
              pending--;
              if (pending === 0) {
                this.poolsAsignados.set(asignaciones);
                this.isLoadingExtras.set(false);
              }
            },
            error: () => {
              pending--;
              if (pending === 0) {
                this.poolsAsignados.set(asignaciones);
                this.isLoadingExtras.set(false);
              }
            }
          });
        });
      }
    });
  }

  getInitials(correo?: string): string {
    if (!correo) return '';
    return correo.substring(0, 2).toUpperCase();
  }

  getRolLabel(rol?: string): string {
    if (!rol) return '';
    const roles: Record<string, string> = {
      ADMINISTRADOR_EMPRESA: 'Administrador',
      EDITOR: 'Editor',
      SOLO_LECTURA: 'Solo Lectura'
    };
    return roles[rol] ?? rol;
  }
}
