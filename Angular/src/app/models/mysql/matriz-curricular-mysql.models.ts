import { CursoMySQL } from "./curso-mysql.models";

export interface MatrizCurricularMySQL {
    id: number;
    nome: string;
    ano: number;
    semestre: number;
    curso: CursoMySQL;
}