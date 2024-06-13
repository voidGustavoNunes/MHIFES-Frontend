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

    return this.http.get<Page<Horario>>(`${this.API}`, { params });
  }

  buscarPorId(id: number): Observable<Horario> {
    return this.http.get<Horario>(`${this.API}/${id}`);
  }

  criar(record: Horario[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Horario[]): Observable<Object> {
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
};
