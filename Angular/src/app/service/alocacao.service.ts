import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, first, map, throwError } from 'rxjs';
import { Alocacao } from '../models/postgres/alocacao.models';
import { Log } from '../models/postgres/log.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class AlocacaoService {
  private readonly API = '/api/alocacoes';

  constructor(private http: HttpClient) { }

  listar(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  listarAtivos(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}/ativos`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  listarInativos(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}/inativos`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  buscarPorId(id: number): Observable<Alocacao> {
    return this.http.get<Alocacao>(`${this.API}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  criar(record: Alocacao[]): Observable<Object> {
    return this.http.post(`${this.API}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizar(id: number, record: Alocacao[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, { observe: 'response' }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  buscarPorIdRegistro(id: number): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.API}/log/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.error || error.error.message || 'Erro desconhecido');
  }

  
	// FILTER ALOCAÇÃO ATIVO
  acharProfessorAtivo(page: number, size: number, substring: string): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Alocacao>>(`${this.API}/ativos/filter/professor`, { params });
  }
  acharLocalAtivo(page: number, size: number, substring: string): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Alocacao>>(`${this.API}/ativos/filter/local`, { params });
  }
  acharDisciplinaAtivo(page: number, size: number, substring: string): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Alocacao>>(`${this.API}/ativos/filter/disciplina`, { params });
  }
  acharHorarioAtivo(page: number, size: number, substring: string): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('time', substring);

    return this.http.get<Page<Alocacao>>(`${this.API}/ativos/filter/horario`, { params });
  }
  
	// FILTER ALOCAÇÃO INATIVO
  acharProfessorInativo(page: number, size: number, substring: string): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Alocacao>>(`${this.API}/inativos/filter/professor`, { params });
  }
  acharLocalInativo(page: number, size: number, substring: string): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Alocacao>>(`${this.API}/inativos/filter/local`, { params });
  }
  acharDisciplinaInativo(page: number, size: number, substring: string): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('substring', substring);

    return this.http.get<Page<Alocacao>>(`${this.API}/inativos/filter/disciplina`, { params });
  }
  acharHorarioInativo(page: number, size: number, substring: string): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('time', substring);

    return this.http.get<Page<Alocacao>>(`${this.API}/inativos/filter/horario`, { params });
  }
};
