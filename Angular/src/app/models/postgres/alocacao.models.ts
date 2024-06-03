import { Local } from "./local.models";
import { Horario } from "./horario.models";
import { Semana } from "../share/semana.models";
import { PeriodoDisciplina } from "./periodo.models";
import { Professor } from "./professor.models";

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
}


export interface AlocacaoHour {
  diaSemana: Semana;
  horario: Horario;
}
