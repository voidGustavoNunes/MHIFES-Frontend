import { EixoMySQL } from "./eixo-mysql.models";

export interface CoordenadoriaMySQL {
    id: number;
    nome: string;
    eixo: EixoMySQL;
}