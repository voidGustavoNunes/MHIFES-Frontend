import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coordenadoria } from '../models/coordenadoria.models';

@Injectable()
export class CoordenadoriaService {
  private readonly API = '/api/coordenadorias';

  constructor(private http: HttpClient) { }

  listar(): Observable<Coordenadoria[]> {
    return this.http.get<Coordenadoria[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Coordenadoria> {
    return this.http.get<Coordenadoria>(`${this.API}/${id}`);
  }

  criar(record: Coordenadoria[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Coordenadoria[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
