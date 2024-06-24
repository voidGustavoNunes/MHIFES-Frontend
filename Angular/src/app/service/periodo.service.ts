import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Periodo } from '../models/postgres/periodo.models';
import { Page } from '../models/share/page.models';
    
@Injectable()
export class PeriodoService {
  private readonly API = '/api/periodos';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Periodo[]> {
  //   return this.http.get<Periodo[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Periodo>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Periodo>>(`${this.API}`, { params });
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
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'})
    .pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message || 'Erro desconhecido'));
  }
  
  acharDia(page: number, size: number, substring: string): Observable<Page<Periodo>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Periodo>>(`${this.API}/filter/dia`, { params });
  }
  
  acharAno(page: number, size: number, ano: number): Observable<Page<Periodo>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('ano', ano.toString());

    return this.http.get<Page<Periodo>>(`${this.API}/filter/ano`, { params });
  }
};