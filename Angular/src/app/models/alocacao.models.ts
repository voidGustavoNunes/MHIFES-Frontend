import { Local } from "./local.models";
import { Professor } from "./professor.models";
import { Horario } from "./horario.models";
import { Semana } from "./share/semana.models";
import { PeriodoDisciplina } from "./periodo.models";
import { Disciplina } from "./disciplina.models";

export interface Alocacao {
  id: number;
  horario: Horario;
  turma: string;
  dataAula?: Date;  //  MUDOU PARA NULL = TRUE
  diaSemana?: number; // NOVO ADICIONADO
  local: Local;
  periodoDisciplina: PeriodoDisciplina;
  professor: Professor;
  status: string;
  // horarioInicio: Time;
  // horarioFim: Time;
  // dataAula: Date;
  // periodo: Periodo;
  // alunos: Array<Aluno>;
}


export interface AlocacaoHour {
  diaSemana: Semana;
  horario: Horario;
  // horaInicio: Time;
  // horaFinal: Time;
}
