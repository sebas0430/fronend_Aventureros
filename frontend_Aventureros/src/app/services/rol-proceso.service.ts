import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolProceso, RolProcesoDetalle } from '../models/rol-proceso.model';

/** HU-17/18/19/20 — CRUD de Roles de Proceso */
@Injectable({ providedIn: 'root' })
export class RolProcesoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/roles-proceso';

  /** HU-17 — Crear rol de proceso */
  crearRol(dto: { nombre: string; descripcion: string; empresaId: number; usuarioId: number }): Observable<RolProceso> {
    return this.http.post<RolProceso>(this.apiUrl, dto);
  }

  /** HU-18 — Editar rol de proceso */
  editarRol(id: number, dto: { nombre: string; descripcion: string; usuarioId: number }): Observable<RolProceso> {
    return this.http.put<RolProceso>(`${this.apiUrl}/${id}`, dto);
  }

  /** HU-19 — Eliminar rol de proceso */
  eliminarRol(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }

  /** HU-20 — Listar roles básicos */
  listarPorEmpresa(empresaId: number, usuarioId: number): Observable<RolProceso[]> {
    return this.http.get<RolProceso[]>(`${this.apiUrl}/empresa/${empresaId}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }

  /** HU-20 — Listar roles con detalle (en qué procesos/actividades se usan) */
  listarConDetalle(empresaId: number, usuarioId: number): Observable<RolProcesoDetalle[]> {
    return this.http.get<RolProcesoDetalle[]>(`${this.apiUrl}/empresa/${empresaId}/detalle`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }
}
