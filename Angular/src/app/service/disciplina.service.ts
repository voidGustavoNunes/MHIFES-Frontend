import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Disciplina } from '../models/postgres/disciplina.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class DisciplinaService {
  private readonly API = '/api/disciplinas';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Disciplina[]> {
  //   return this.http.get<Disciplina[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Disciplina>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Disciplina>>(`${this.API}`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  buscarPorId(id: number): Observable<Disciplina> {
    return this.http.get<Disciplina>(`${this.API}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  criar(record: Disciplina[]): Observable<Object> {
    return this.http.post(`${this.API}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizar(id: number, record: Disciplina[]): Observable<Object> {
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

  acharNome(page: number, size: number, substring: string): Observable<Page<Disciplina>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Disciplina>>(`${this.API}/filter/nome`, { params }).pipe(
        catchError(error => this.handleError(error))
      );
  }

  acharSigla(page: number, size: number, substring: string): Observable<Page<Disciplina>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Disciplina>>(`${this.API}/filter/sigla`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }
};
