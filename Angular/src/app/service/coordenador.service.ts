import { Coordenador } from './../models/coordenador.models';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CoordenadorService {
  private readonly API = '/api/coordenador';

  constructor(private http: HttpClient) { }

  listar(): Observable<Coordenador[]> {
    return this.http.get<Coordenador[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Coordenador> {
    return this.http.get<Coordenador>(`${this.API}/${id}`);
  }

  criar(record: Coordenador[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Coordenador[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
