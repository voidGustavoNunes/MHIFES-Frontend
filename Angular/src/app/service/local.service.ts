import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Local, LocalDTO, LocalEquipamento } from '../models/postgres/local.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class LocalService {
  private readonly API = '/api/locais';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Local[]> {
  //   return this.http.get<Local[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Local>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Local>>(`${this.API}`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  buscarPorId(id: number): Observable<Local> {
    return this.http.get<Local>(`${this.API}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  criar(record: Local): Observable<Object> {
    return this.http.post(`${this.API}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizar(id: number, record: Local): Observable<Object> {
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
  
  acharNome(page: number, size: number, substring: string): Observable<Page<Local>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Local>>(`${this.API}/filter/nome`, { params });
  }
  
  acharCapacidade(page: number, size: number, capa: number): Observable<Page<Local>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('capa', capa.toString());

    return this.http.get<Page<Local>>(`${this.API}/filter/capacidade`, { params });
  }
};
