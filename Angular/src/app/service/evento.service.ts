import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../models/postgres/evento.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class EventoService {
  private readonly API = '/api/eventos';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Evento[]> {
  //   return this.http.get<Evento[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Evento>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Evento>>(`${this.API}`, { params });
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
