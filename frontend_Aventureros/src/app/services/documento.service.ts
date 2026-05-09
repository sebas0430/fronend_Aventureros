import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentoDTO } from '../models/documento.model';

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/documentos';

  listarPorProceso(procesoId: number): Observable<DocumentoDTO[]> {
    return this.http.get<DocumentoDTO[]>(`${this.apiUrl}/proceso/${procesoId}`);
  }

  subirDocumento(procesoId: number, archivo: File): Observable<DocumentoDTO> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<DocumentoDTO>(`${this.apiUrl}/proceso/${procesoId}`, formData);
  }

  eliminarDocumento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Helper method to get the download URL so it can be used in href attributes
  getDownloadUrl(id: number): string {
    return `${this.apiUrl}/${id}/descargar`;
  }
}
