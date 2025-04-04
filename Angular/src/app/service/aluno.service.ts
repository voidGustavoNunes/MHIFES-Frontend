import { Injectable } from '@angular/core';
import { Aluno } from '../models/postgres/aluno.models';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Page } from '../models/share/page.models';

@Injectable()
export class AlunoService {
  private readonly API = '/api/alunos';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Aluno[]> {
  //   return this.http.get<Aluno[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Aluno>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Aluno>>(`${this.API}`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  buscarPorId(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.API}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  criar(record: Aluno[]): Observable<Object> {
    return this.http.post(`${this.API}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizar(id: number, record: Aluno): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, { observe: 'response' })
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.error || error.error.message || 'Erro desconhecido');
  }

  acharNome(page: number, size: number, substring: string): Observable<Page<Aluno>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Aluno>>(`${this.API}/filter/nome`, { params });
  }

  acharMatricula(page: number, size: number, substring: string): Observable<Page<Aluno>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Aluno>>(`${this.API}/filter/matricula`, { params });
  }
};
