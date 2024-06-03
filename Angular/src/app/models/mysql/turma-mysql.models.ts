import { MatrizCurricularMySQL } from "./matriz-curricular-mysql.models";

export interface TurmaMySQL {
    id: number;
    nome: string;
    turno: string;
    ano: number;
    semestre: number;
    ativa: boolean;
    matriz: MatrizCurricularMySQL;
}