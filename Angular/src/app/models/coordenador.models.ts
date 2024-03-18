import { Professor } from "./professor.models";

export interface Coordenador {
  id: number;
  professor: Professor;
  coordenadoria: string; //trocar futuramente

}
