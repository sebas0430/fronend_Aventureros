import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConectorExterno, EnvioExterno, NotificacionExterna } from '../models/conector-externo.model';

/** HU-26 — Notificaciones externas (Email, Webhook, Queue) */
@Injectable({ providedIn: 'root' })
export class NotificacionExternaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/notificaciones-externas';

  // ── Conectores ──────────────────────────────────────────────────
  crearConector(dto: ConectorExterno): Observable<ConectorExterno> {
    return this.http.post<ConectorExterno>(`${this.apiUrl}/conectores`, dto);
  }

  editarConector(id: number, dto: ConectorExterno): Observable<ConectorExterno> {
    return this.http.put<ConectorExterno>(`${this.apiUrl}/conectores/${id}`, dto);
  }

  eliminarConector(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conectores/${id}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }

  listarConectores(empresaId: number): Observable<ConectorExterno[]> {
    return this.http.get<ConectorExterno[]>(`${this.apiUrl}/conectores/empresa/${empresaId}`);
  }

  // ── Envío ──────────────────────────────────────────────────────
  enviarMensaje(dto: EnvioExterno): Observable<NotificacionExterna> {
    return this.http.post<NotificacionExterna>(`${this.apiUrl}/enviar`, dto);
  }

  // ── Logs ───────────────────────────────────────────────────────
  logsPorProceso(procesoId: number): Observable<NotificacionExterna[]> {
    return this.http.get<NotificacionExterna[]>(`${this.apiUrl}/logs/proceso/${procesoId}`);
  }

  logsPorConector(conectorId: number): Observable<NotificacionExterna[]> {
    return this.http.get<NotificacionExterna[]>(`${this.apiUrl}/logs/conector/${conectorId}`);
  }
}
