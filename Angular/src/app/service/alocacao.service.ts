import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alocacao } from '../models/alocacao.models';

@Injectable()
export class AlocacaoService {
  private readonly API = '/api/alocacoes';

  constructor(private http: HttpClient) { }

  listar(): Observable<Alocacao[]> {
    return this.http.get<Alocacao[]>(`${this.API}`);
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
};
