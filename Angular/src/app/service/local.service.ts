import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local } from '../models/local.models';

@Injectable()
export class LocalService {
  private readonly API = '/api/locais';

  constructor(private http: HttpClient) { }

  listar(): Observable<Local[]> {
    return this.http.get<Local[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Local> {
    return this.http.get<Local>(`${this.API}/${id}`);
  }

  criar(record: Local[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Local[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
