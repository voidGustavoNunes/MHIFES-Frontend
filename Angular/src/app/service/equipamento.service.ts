import { Injectable } from '@angular/core';
import { Equipamento } from '../models/postgres/equipamento.models';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Page } from '../models/share/page.models';

@Injectable()
export class EquipamentoService {
  private readonly API = '/api/equipamentos';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Equipamento[]> {
  //   return this.http.get<Equipamento[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Equipamento>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Equipamento>>(`${this.API}`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  buscarPorId(id: number): Observable<Equipamento> {
    return this.http.get<Equipamento>(`${this.API}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  criar(record: Equipamento[]): Observable<Object> {
    return this.http.post(`${this.API}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizar(id: number, record: Equipamento[]): Observable<Object> {
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

  acharNome(page: number, size: number, substring: string): Observable<Page<Equipamento>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Equipamento>>(`${this.API}/filter/nome`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }
};
