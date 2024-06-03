import { Coordenadoria } from "./coordenadoria.models";

export interface Professor {
  id: number;
  email?: string;
  nome: string;
  matricula: string;
  sigla: string;
  ehCoordenador: boolean;
  coordenadoria?: Coordenadoria;
  // nomeUser?: string;
  // senha?: string;
  // curso?: string; // mudar futuramente para quando formos mapear os cursos
}