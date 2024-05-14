import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HomeService {
  private readonly API = '/api/home';

  constructor(private http: HttpClient) { }

  gerarRelatorioDisciplinaTurma(ano: number, semestre: number): Observable<string> {
    return this.http.get<string>(`${this.API}/relatorio/disciplinas_turma/${ano}/${semestre}`);
  }
};
