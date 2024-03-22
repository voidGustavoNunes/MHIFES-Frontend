import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.models';

@Injectable()
export class EventoService {
  private readonly API = '/api/eventos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.API}/${id}`);
  }

  criar(record: Evento[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Evento[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
