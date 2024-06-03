import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local, LocalDTO, LocalEquipamento } from '../models/postgres/local.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class LocalService {
  private readonly API = '/api/locais';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Local[]> {
  //   return this.http.get<Local[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Local>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Local>>(`${this.API}`, { params });
  }

  buscarPorId(id: number): Observable<Local> {
    return this.http.get<Local>(`${this.API}/${id}`);
  }

  criar(record: Local): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Local): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
