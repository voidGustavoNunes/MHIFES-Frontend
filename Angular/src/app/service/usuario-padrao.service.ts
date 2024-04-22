import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioPadrao } from '../models/pessoa.models';
    
@Injectable()
export class UsuarioPadraoService {
  private readonly API = '/api/usarios-padrao';

  constructor(private http: HttpClient) { }

  listar(): Observable<UsuarioPadrao[]> {
    return this.http.get<UsuarioPadrao[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<UsuarioPadrao> {
    return this.http.get<UsuarioPadrao>(`${this.API}/${id}`);
  }

  criar(record: UsuarioPadrao[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: UsuarioPadrao): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
