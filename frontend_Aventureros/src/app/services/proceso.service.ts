import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proceso, CrearProcesoRequest, ProcesoCompartirDTO } from '../models/proceso.model';

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

  listarPorAutor(autorId: number): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(`${this.apiUrl}/autor/${autorId}`);
  }

  listarProcesosCompartidosConPool(poolId: number, usuarioId: number): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(`${this.apiUrl}/compartidos/${poolId}?usuarioId=${usuarioId}`);
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

  // ── Compartición con Pools ──────────────────────────────────
  compartirProceso(id: number, dto: ProcesoCompartirDTO): Observable<ProcesoCompartirDTO> {
    return this.http.post<ProcesoCompartirDTO>(`${this.apiUrl}/${id}/compartir`, dto);
  }

  quitarComparticion(id: number, poolDestinoId: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/compartir/${poolDestinoId}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }

  // ── Filtrado por estado / categoría ─────────────────────────
  filtrarProcesos(empresaId: number, estado?: string, categoria?: string): Observable<Proceso[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (categoria) params = params.set('categoria', categoria);
    return this.http.get<Proceso[]>(`${this.apiUrl}/empresa/${empresaId}`, { params });
  }
}
