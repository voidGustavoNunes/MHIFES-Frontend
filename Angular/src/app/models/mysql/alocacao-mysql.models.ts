import { AulaMySQL } from "./aula-mysql.models";
import { DisciplinaMySQL } from "./disciplina-mysql.models";
import { ProfessorMySQL } from "./professor-mysql.models";

export interface AlocacaoMySQL {
	id: number;
	ano: number;
	semestre: number;
	disciplinaMySQL: DisciplinaMySQL;
	professor1: ProfessorMySQL;
	professor2: ProfessorMySQL;
	aulas: Array<AulaMySQL>;
}