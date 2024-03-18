import { Injectable } from '@angular/core';
import { Aluno} from '../models/aluno.models';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AlunoService {
  private readonly API = '/api/alunos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.API}/${id}`);
  }

  criar(record: Aluno[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Aluno[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
