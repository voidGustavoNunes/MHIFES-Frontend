import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, first, map, of, tap, throwError } from 'rxjs';

@Injectable()
export class HomeService {
  private readonly API = '/api/relatorios';

  constructor(private http: HttpClient) { }

  gerarRelatorioDisciplinaTurma(ano: number, semestre: number) {
    return this.http.get<any>(`${this.API}/disciplinas_turma/${ano}/${semestre}`)
      .pipe(
        map(response => response.message),
        catchError(error => {
          return this.handleError(error);
        }),
        map(response => response.data)
      );
  }

  gerarRelatorioHorarioTurma(ano: number, semestre: number, turma?: string) {
    if (turma == undefined) {
      return this.http.get<any>(`${this.API}/horarios_turma/${ano}/${semestre}`)
        .pipe(
          map(response => response.message),
          catchError(error => {
            return this.handleError(error);
          }),
          map(response => response.data)
        );
    } else {
      return this.http.get<any>(`${this.API}/horarios_turma/${turma}/${ano}/${semestre}`)
        .pipe(
          map(response => response.message),
          catchError(error => {
            return this.handleError(error);
          }),
          map(response => response.data)
        );
    }
  }

  gerarRelatorioHorarioPorProfessor(ano: number, semestre: number, profId?: number, coodId?: number) {
    if (profId == undefined && coodId === undefined) {
      return this.http.get<any>(`${this.API}/horarios_professor/${ano}/${semestre}`)
        .pipe(
          map(response => response.message),
          catchError(error => {
            return this.handleError(error);
          }),
          map(response => response.data)
        );
    } else if (profId == undefined) {
      return this.http.get<any>(`${this.API}/horarios_professor/${coodId}/${ano}/${semestre}`)
        .pipe(
          map(response => response.message),
          catchError(error => {
            return this.handleError(error);
          }),
          map(response => response.data)
        );
    } else {
      return this.http.get<any>(`${this.API}/horarios_professor/${coodId}/${profId}/${ano}/${semestre}`)
        .pipe(
          map(response => response.message),
          catchError(error => {
            return this.handleError(error);
          }),
          map(response => response.data)
        );
    }
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.error || error.error.message || 'Erro desconhecido');
  }
};
