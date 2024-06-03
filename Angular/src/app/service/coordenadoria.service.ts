import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coordenadoria } from '../models/postgres/coordenadoria.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class CoordenadoriaService {
  private readonly API = '/api/coordenadorias';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Coordenadoria[]> {
  //   return this.http.get<Coordenadoria[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Coordenadoria>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Coordenadoria>>(`${this.API}`, { params });
  }

  buscarPorId(id: number): Observable<Coordenadoria> {
    return this.http.get<Coordenadoria>(`${this.API}/${id}`);
  }

  criar(record: Coordenadoria): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Coordenadoria): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
