import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AlocacaoMySQL } from '../models/mysql/alocacao-mysql.models';
import { Page } from '../models/share/page.models';
import { ProfessorMySQL } from '../models/mysql/professor-mysql.models';

@Injectable()
export class MigrationService {
  private readonly API = '/api/migrate';

  constructor(private http: HttpClient) { }

  migrateAlocacoes(alocacaoList: AlocacaoMySQL[]): Observable<any> {
    return this.http.post(`${this.API}`, alocacaoList).pipe(
      catchError(error => this.handleError(error))
    );
  }

  listaMysql(): Observable<AlocacaoMySQL[]> {
    return this.http.get<AlocacaoMySQL[]>(`${this.API}/alocacoes-mysql`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.error || error.error.message || 'Erro desconhecido');
  }
}
