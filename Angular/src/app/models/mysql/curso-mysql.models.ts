import { CoordenadoriaMySQL } from "./coordenadoria-mysql.models";
import { ProfessorMySQL } from "./professor-mysql.models";

export interface CursoMySQL {
	id: number;
	nome: string;
	qtPeriodos: number;
	nivel: string;
	semestral: boolean;
	coordenadoria: CoordenadoriaMySQL;
	professor: ProfessorMySQL;
}