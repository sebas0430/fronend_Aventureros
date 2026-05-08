import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lane } from '../models/lane.model';

/** HU-22 — CRUD de Lanes (Swimlanes) dentro de un Pool */
@Injectable({ providedIn: 'root' })
export class LaneService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/lanes';

  crearLane(dto: Lane): Observable<Lane> {
    return this.http.post<Lane>(this.apiUrl, dto);
  }

  editarLane(id: number, dto: Partial<Lane>): Observable<Lane> {
    return this.http.put<Lane>(`${this.apiUrl}/${id}`, dto);
  }

  eliminarLane(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }

  listarPorPool(poolId: number, usuarioId: number): Observable<Lane[]> {
    return this.http.get<Lane[]>(`${this.apiUrl}/pool/${poolId}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }
}
