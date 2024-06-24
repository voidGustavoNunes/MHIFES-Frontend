import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Horario } from '../models/postgres/horario.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class HorarioService {
  private readonly API = '/api/horarios';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Horario[]> {
  //   return this.http.get<Horario[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Horario>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Horario>>(`${this.API}`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  buscarPorId(id: number): Observable<Horario> {
    return this.http.get<Horario>(`${this.API}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  criar(record: Horario[]): Observable<Object> {
    return this.http.post(`${this.API}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizar(id: number, record: Horario[]): Observable<Object> {
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
  
  acharTimeInicio(page: number, size: number, time: string): Observable<Page<Horario>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('time', time.toString());

    return this.http.get<Page<Horario>>(`${this.API}/filter/inicio`, { params });
  }
  
  acharTimeFim(page: number, size: number, time: string): Observable<Page<Horario>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('time', time.toString());

    return this.http.get<Page<Horario>>(`${this.API}/filter/fim`, { params });
  }
};
