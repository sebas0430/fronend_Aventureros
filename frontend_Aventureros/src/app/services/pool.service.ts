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
}
