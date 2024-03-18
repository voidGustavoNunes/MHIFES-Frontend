import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Disciplina } from '../models/disciplina.models';
    
@Injectable()
export class DisciplinaService {
  private readonly API = '/api/disciplinas';

  constructor(private http: HttpClient) { }

  listar(): Observable<Disciplina[]> {
    return this.http.get<Disciplina[]>(`${this.API}`);
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