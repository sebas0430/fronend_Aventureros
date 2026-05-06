import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-confirmar-eliminar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmar-eliminar.html',
  styleUrl: './confirmar-eliminar.css'
})
export class ConfirmarEliminarComponent {
  @Input() usuario: Usuario | null = null;
  @Input() guardando = false;
  
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
