import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolPool, AsignacionRolDTO } from '../models/rol-pool.model';

@Injectable({ providedIn: 'root' })
export class RolPoolService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/roles-pool';

  listarRolesPorPool(poolId: number, usuarioId: number): Observable<RolPool[]> {
    return this.http.get<RolPool[]>(`${this.apiUrl}/pool/${poolId}?usuarioId=${usuarioId}`);
  }

  asignarRol(dto: AsignacionRolDTO): Observable<AsignacionRolDTO> {
    return this.http.post<AsignacionRolDTO>(`${this.apiUrl}/asignar`, dto);
  }

  obtenerRolDeUsuario(usuarioDestinoId: number, poolId: number): Observable<AsignacionRolDTO> {
    return this.http.get<AsignacionRolDTO>(`${this.apiUrl}/usuario/${usuarioDestinoId}/pool/${poolId}`);
  }
}
