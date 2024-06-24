import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, first, map, throwError } from 'rxjs';
import { Alocacao } from '../models/postgres/alocacao.models';
import { Log } from '../models/postgres/log.models';
import { Page } from '../models/share/page.models';

@Injectable()
export class AlocacaoService {
  private readonly API = '/api/alocacoes';

  constructor(private http: HttpClient) { }

  // listar(): Observable<Alocacao[]> {
  //   return this.http.get<Alocacao[]>(`${this.API}`);
  // }

  listar(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}`, { params });
  }

  listarAtivos(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}/ativos`, { params });
  }

  listarInativos(page: number, size: number): Observable<Page<Alocacao>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Alocacao>>(`${this.API}/inativos`, { params });
  }

  buscarPorId(id: number): Observable<Alocacao> {
    return this.http.get<Alocacao>(`${this.API}/${id}`);
  }

  criar(record: Alocacao[]): Observable<Object> {
    return this.http.post(`${this.API}`, record).pipe(
      catchError((error: any) => {
        return throwError(error.error.message || 'Erro desconhecido');
      })
    );
  }

  atualizar(id: number, record: Alocacao[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record).pipe(
      catchError(error => {
        return throwError(error.error.message || 'Erro desconhecido');
      })
    );
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'}).pipe(
      catchError(error => {
        return throwError(error.error.message || 'Erro desconhecido');
      })
    );
  }

  buscarPorIdRegistro(id: number): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.API}/log/${id}`);
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
