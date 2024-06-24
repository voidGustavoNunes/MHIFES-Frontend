import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Evento } from '../models/postgres/evento.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class EventoService {
  private readonly API = '/api/eventos';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Evento[]> {
  //   return this.http.get<Evento[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Evento>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Evento>>(`${this.API}`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  buscarPorId(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.API}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  criar(record: Evento[]): Observable<Object> {
    return this.http.post(`${this.API}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizar(id: number, record: Evento[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, { observe: 'response' }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  acharNome(page: number, size: number, substring: string): Observable<Page<Evento>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Evento>>(`${this.API}/filter/nome`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  acharDia(page: number, size: number, substring: string): Observable<Page<Evento>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Evento>>(`${this.API}/filter/dia`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  acharTimeInicio(page: number, size: number, time: string): Observable<Page<Evento>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('time', time.toString());

    return this.http.get<Page<Evento>>(`${this.API}/filter/inicio`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.error || error.error.message || 'Erro desconhecido');
  }

};
