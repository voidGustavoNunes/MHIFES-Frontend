import { Professor } from "./professor.models";

export interface Coordenadoria {
  id: number;
  nome: string;
  coordenador: Professor;
}
