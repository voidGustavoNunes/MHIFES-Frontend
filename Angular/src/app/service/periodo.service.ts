import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Periodo } from '../models/periodo.models';
    
@Injectable()
export class PeriodoService {
  private readonly API = '/api/periodos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Periodo> {
    return this.http.get<Periodo>(`${this.API}/${id}`);
  }

  criar(record: Periodo[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Periodo[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};