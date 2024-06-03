import { MatrizCurricularMySQL } from "./matriz-curricular-mysql.models";

export interface DisciplinaMySQL {
	id: number;
	nome: string;
	sigla: string;
	tipo: string;
	cargaHoraria: number;
	qtAulas: number;
	periodo: number;
	matriz: MatrizCurricularMySQL;
}