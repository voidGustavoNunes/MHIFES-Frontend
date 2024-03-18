import { Injectable } from '@angular/core';
import { Professor} from '../models/professor.models';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ProfessorService {
  private readonly API = '/api/professor';

  constructor(private http: HttpClient) { }

  listar(): Observable<Professor[]> {
    return this.http.get<Professor[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.API}/${id}`);
  }

  criar(record: Professor[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Professor[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
