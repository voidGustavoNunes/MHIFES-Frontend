import { Injectable } from '@angular/core';
import { Equipamento } from '../models/postgres/equipamento.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/share/page.models';
    
@Injectable()
export class EquipamentoService {
  private readonly API = '/api/equipamentos';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Equipamento[]> {
  //   return this.http.get<Equipamento[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Equipamento>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Equipamento>>(`${this.API}`, { params });
  }

  buscarPorId(id: number): Observable<Equipamento> {
    return this.http.get<Equipamento>(`${this.API}/${id}`);
  }

  criar(record: Equipamento[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Equipamento[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};