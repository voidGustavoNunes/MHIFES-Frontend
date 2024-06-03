import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlocacaoMySQL } from '../models/mysql/alocacao-mysql.models';
import { Page } from '../models/share/page.models';
import { ProfessorMySQL } from '../models/mysql/professor-mysql.models';

@Injectable()
export class MigrationService {
  private readonly API = '/api/migrate';

  constructor(private http: HttpClient) { }

  migrateAlocacoes(alocacaoList: AlocacaoMySQL[]): Observable<any> {
    return this.http.post(`${this.API}`, alocacaoList);
  }

  listaMysql(): Observable<AlocacaoMySQL[]> {
    return this.http.get<AlocacaoMySQL[]>(`${this.API}/alocacoes-mysql`);
  }
}
