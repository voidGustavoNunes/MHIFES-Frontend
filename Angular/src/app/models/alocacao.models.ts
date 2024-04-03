import { Time } from "@angular/common";
import { Local } from "./local.models";
import { Disciplina } from "./disciplina.models";
import { Periodo } from "./periodo.models";
import { Professor } from "./professor.models";
import { Aluno } from "./aluno.models";

export interface Alocacao {
  id: number;
  numAulas: number;
  horaInicio: Time;
  horaFinal: Time;
  turma: string;
  diaSemana: string;
  dataAula: Date;
  local: Local;
  disciplina: Disciplina;
  periodo: Periodo;
  professor: Professor;
  alunos: Array<Aluno>;
}
