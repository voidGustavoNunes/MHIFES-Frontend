import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, first, map, of, tap } from 'rxjs';

@Injectable()
export class HomeService {
  private readonly API = '/api/home';

  constructor(private http: HttpClient) { }

  gerarRelatorioDisciplinaTurma(ano: number, semestre: number) {
    return this.http.get<any>(`${this.API}/relatorio/disciplinas_turma/${ano}/${semestre}`)
    .pipe(
      catchError(error => {
        return this.handleError(error);
      }),
      map(response => response.data)
    );
  }

  gerarRelatorioHorarioTurma(ano: number, semestre: number, turma?: string) {
    if(turma == undefined) {
      return this.http.get<any>(`${this.API}/relatorio/horarios_turma/${ano}/${semestre}`)
      .pipe(
        catchError(error => {
          return this.handleError(error);
        }),
        map(response => response.data)
      );
    } else {
      return this.http.get<any>(`${this.API}/relatorio/horarios_turma/${turma}/${ano}/${semestre}`)
      .pipe(
        catchError(error => {
          return this.handleError(error);
        }),
        map(response => response.data)
      );
    }
  }

  gerarRelatorioHorarioPorProfessor(ano: number, semestre: number, profId?: number, coodId?: number) {
    if(profId == undefined && coodId === undefined) {
      return this.http.get<any>(`${this.API}/relatorio/horarios_professor/${ano}/${semestre}`)
      .pipe(
        catchError(error => {
          return this.handleError(error);
        }),
        map(response => response.data)
      );
    } else if(profId == undefined) {
      return this.http.get<any>(`${this.API}/relatorio/horarios_professor/${coodId}/${ano}/${semestre}`)
      .pipe(
        catchError(error => {
          return this.handleError(error);
        }),
        map(response => response.data)
      );
    } else {
      return this.http.get<any>(`${this.API}/relatorio/horarios_professor/${coodId}/${profId}/${ano}/${semestre}`)
      .pipe(
        catchError(error => {
          return this.handleError(error);
        }),
        map(response => response.data)
      );
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      return of('Relatório não encontrado para o ano e semestre especificados.');
    } else {
      return of('An unexpected error occurred while fetching the report.');
    }
  }
};
