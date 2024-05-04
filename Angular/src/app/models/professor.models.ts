import { Coordenadoria } from "./coordenadoria.models";

export interface Professor {
  id: number;
  nome: string;
  matricula: string;
  sigla: string;
  ehCoordenador: boolean;
  nomeUser?: string;
  senha?: string;
  // coordenadoria: Coordenadoria;
  // curso?: string; // mudar futuramente para quando formos mapear os cursos
}