import { Periodo } from "./periodo.models";

export interface Aluno {
  id: number;
  nome: string;
  matricula: number;
  periodo: Periodo;
  curso: string; //mudar futuramente para quando formos mapear os cursos
}
