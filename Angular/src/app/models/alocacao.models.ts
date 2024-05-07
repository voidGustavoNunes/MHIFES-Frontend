import { Time } from "@angular/common";
import { Local } from "./local.models";
import { Disciplina } from "./disciplina.models";
import { Periodo } from "./periodo.models";
import { Professor } from "./professor.models";
import { Aluno } from "./aluno.models";
import { Horario } from "./horario.models";
import { Semana } from "./share/semana.models";

export interface Alocacao {
  id: number;
  horario: Horario;
  turma: string;
  dataAula: Date;
  local: Local;
  periodoDisciplina: PeriodoDisciplina;
  professor: Professor;
  status: string;
  // numAulas: number;
  // horarioInicio: Time;
  // horarioFim: Time;
  // dataAula: Date;
  // disciplina: Disciplina;
  // periodo: Periodo;
  // alunos: Array<Aluno>;
}


export interface AlocacaoHour {
  diaSemana: Semana;
  horario: Horario;
  // horaInicio: Time;
  // horaFinal: Time;
}

export interface PeriodoDisciplina {
  id: number;
  periodo: Periodo;
  disciplina: Disciplina;
  alunos: Array<Aluno>;
}
