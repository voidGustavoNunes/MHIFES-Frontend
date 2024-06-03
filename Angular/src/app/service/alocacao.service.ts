import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Alocacao } from '../models/postgres/alocacao.models';
import { Log } from '../models/postgres/log.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class AlocacaoService {
  private readonly API = '/api/alocacoes';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Alocacao[]> {
  //   return this.http.get<Alocacao[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}`, { params });
  }

  listarAtivos(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}/ativos?page=${page}&size=${size}`, { params });
  }

  listarInativos(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}/inativos?page=${page}&size=${size}`, { params });
  }

  buscarPorId(id: number): Observable<Alocacao> {
    return this.http.get<Alocacao>(`${this.API}/${id}`);
  }

  criar(record: Alocacao[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Alocacao[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }

  buscarPorIdRegistro(id: number): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.API}/log/${id}`);
  }
};
