import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Disciplina } from '../models/postgres/disciplina.models';
import { Page } from '../models/share/page.models';
    
@Injectable()
export class DisciplinaService {
  private readonly API = '/api/disciplinas';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Disciplina[]> {
  //   return this.http.get<Disciplina[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Disciplina>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Disciplina>>(`${this.API}`, { params });
  }

  buscarPorId(id: number): Observable<Disciplina> {
    return this.http.get<Disciplina>(`${this.API}/${id}`);
  }

  criar(record: Disciplina[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Disciplina[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};