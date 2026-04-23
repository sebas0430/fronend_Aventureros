import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proceso, CrearProcesoRequest } from '../models/proceso.model';

@Injectable({ providedIn: 'root' })
export class ProcesoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/procesos';

  crearProceso(dto: CrearProcesoRequest): Observable<Proceso> {
    return this.http.post<Proceso>(this.apiUrl, dto);
  }

  listarPorEmpresa(empresaId: number): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  obtenerProceso(id: number): Observable<Proceso> {
    return this.http.get<Proceso>(`${this.apiUrl}/${id}`);
  }

  guardarDefinicion(id: number, definicionJson: string): Observable<Proceso> {
    return this.http.patch<Proceso>(`${this.apiUrl}/${id}/definicion`, { definicionJson });
  }

  cambiarEstado(id: number, estado: string, usuarioId: number): Observable<Proceso> {
    return this.http.patch<Proceso>(`${this.apiUrl}/${id}/estado`, { estado, usuarioId });
  }

  eliminarProceso(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }
}
