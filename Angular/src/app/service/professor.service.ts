import { Injectable } from '@angular/core';
import { Professor } from '../models/postgres/professor.models';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Page } from '../models/share/page.models';
    
@Injectable()
export class ProfessorService {
  private readonly API = '/api/professores';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Professor[]> {
  //   return this.http.get<Professor[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Professor>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Professor>>(`${this.API}`, { params });
  }

  buscarPorId(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.API}/${id}`);
  }

  criar(record: Professor[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Professor): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'})
    .pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message || 'Erro desconhecido'));
  }
  
  acharNome(page: number, size: number, substring: string): Observable<Page<Professor>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Professor>>(`${this.API}/filter/nome`, { params });
  }
  
  acharSigla(page: number, size: number, substring: string): Observable<Page<Professor>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Professor>>(`${this.API}/filter/sigla`, { params });
  }
  
  acharMatricula(page: number, size: number, substring: string): Observable<Page<Professor>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Professor>>(`${this.API}/filter/matricula`, { params });
  }
};
