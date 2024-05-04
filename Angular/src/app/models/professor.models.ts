import { Coordenadoria } from "./coordenadoria.models";

export interface Professor {
  id: number;
  nome: string;
  matricula: string;
  sigla: string;
  ehCoordenador: boolean;
  coordenadoria: Coordenadoria;
  nomeUser?: string;
  senha?: string;
  // curso?: string; // mudar futuramente para quando formos mapear os cursos
}