import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pool } from '../models/pool.model';

@Injectable({ providedIn: 'root' })
export class PoolService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pools';

  listarPorEmpresa(empresaId: number): Observable<Pool[]> {
    return this.http.get<Pool[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  crearPool(pool: Omit<Pool, 'id'>): Observable<Pool> {
    return this.http.post<Pool>(this.apiUrl, pool);
  }

  editarPool(id: number, pool: Partial<Pool>): Observable<Pool> {
    return this.http.put<Pool>(`${this.apiUrl}/${id}`, pool);
  }

  eliminarPool(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}?usuarioId=${usuarioId}`);
  }
}
