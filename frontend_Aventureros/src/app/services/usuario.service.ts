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

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  cambiarActivo(id: number, activo: boolean): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, { activo });
  }

  cambiarRol(id: number, rol: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, { rol });
  }

  invitarPorCorreo(correo: string, empresaId: number, rol: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/invitar`, { correo, empresaId, rol, password });
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
