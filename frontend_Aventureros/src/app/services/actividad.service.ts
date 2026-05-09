import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActividadRegistroDTO, ActividadEdicionDTO } from '../models/actividad.model';

@Injectable({ providedIn: 'root' })
export class ActividadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/actividades';

  crearActividad(dto: ActividadRegistroDTO): Observable<ActividadRegistroDTO> {
    return this.http.post<ActividadRegistroDTO>(this.apiUrl, dto);
  }

  editarActividad(id: number, dto: ActividadEdicionDTO): Observable<ActividadEdicionDTO> {
    return this.http.put<ActividadEdicionDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminarActividad(id: number, usuarioId: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }

  listarPorProceso(procesoId: number): Observable<ActividadRegistroDTO[]> {
    return this.http.get<ActividadRegistroDTO[]>(`${this.apiUrl}/proceso/${procesoId}`);
  }

  obtenerActividad(id: number): Observable<ActividadRegistroDTO> {
    return this.http.get<ActividadRegistroDTO>(`${this.apiUrl}/${id}`);
  }
}
