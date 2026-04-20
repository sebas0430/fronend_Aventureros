import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  listarPorEmpresa(empresaId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  cambiarActivo(id: number, activo: boolean): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, { activo });
  }
}
