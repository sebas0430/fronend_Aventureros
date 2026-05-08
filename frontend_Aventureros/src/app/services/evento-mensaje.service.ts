import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventoMensaje, MensajeEjecucion } from '../models/evento-mensaje.model';

/** HU-25/27/28 — Message Throw / Catch / Correlación */
@Injectable({ providedIn: 'root' })
export class EventoMensajeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/eventos-mensaje';
  private catchUrl = 'http://localhost:8080/api/message-catch';

  /** HU-25 — Crear evento THROW o CATCH en un proceso */
  crearEvento(dto: EventoMensaje): Observable<EventoMensaje> {
    return this.http.post<EventoMensaje>(this.apiUrl, dto);
  }

  /** HU-25 — Lanzar mensaje THROW (dispara el mensaje hacia otros procesos) */
  lanzarMensaje(dto: { eventoOrigenId: number; payload?: string; usuarioId: number }): Observable<MensajeEjecucion[]> {
    return this.http.post<MensajeEjecucion[]>(`${this.apiUrl}/lanzar`, dto);
  }

  /** Listar eventos de un proceso */
  listarPorProceso(procesoId: number): Observable<EventoMensaje[]> {
    return this.http.get<EventoMensaje[]>(`${this.apiUrl}/proceso/${procesoId}`);
  }

  /** Eliminar evento */
  eliminarEvento(id: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: new HttpParams().set('usuarioId', usuarioId)
    });
  }

  /** Logs de lanzamiento de un evento origen */
  logsDeEnvio(eventoId: number): Observable<MensajeEjecucion[]> {
    return this.http.get<MensajeEjecucion[]>(`${this.apiUrl}/logs/${eventoId}`);
  }

  /** HU-27 — Recibir mensaje externo (Message Catch) */
  recibirMensaje(dto: { nombreMensaje: string; correlacionKey?: string; payload?: string }): Observable<any[]> {
    return this.http.post<any[]>(`${this.catchUrl}/recibir`, dto);
  }

  /** HU-28 — Logs de recepción por proceso */
  logsPorProceso(procesoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.catchUrl}/logs/proceso/${procesoId}`);
  }
}
