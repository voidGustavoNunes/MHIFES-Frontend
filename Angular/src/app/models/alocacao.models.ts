import { Time } from "@angular/common";
import { Local } from "./local.models";
import { Disciplina } from "./disciplina.models";
import { Periodo } from "./periodo.models";
import { Professor } from "./professor.models";
import { Aluno } from "./aluno.models";
import { Horario } from "./horario.models";

export interface Alocacao {
  id: number;
  numAulas: number;
  horario: Horario;
  // horaInicio: Time;
  // horaFinal: Time;
  turma: string;
  diaSemana: string;
  dataAula: Date;
  local: Local;
  disciplina: Disciplina;
  periodo: Periodo;
  professor: Professor;
  alunos: Array<Aluno>;
}
