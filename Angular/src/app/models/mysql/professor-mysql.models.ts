import { CoordenadoriaMySQL } from "./coordenadoria-mysql.models";
import { ServidorMySQL } from "./servidor-mysql.models";

export interface ProfessorMySQL extends ServidorMySQL {
    cargaHoraria: number;
    ativo: boolean;
    coordenadoria: CoordenadoriaMySQL;
}