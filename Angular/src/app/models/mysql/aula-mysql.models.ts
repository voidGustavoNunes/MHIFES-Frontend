import { AlocacaoMySQL } from "./alocacao-mysql.models";
import { OfertaMySQL } from "./oferta-mysql.models";

export interface AulaMySQL {
	id: number;
	numero: number;
	dia: number;
	turno: number;
	alocacao: AlocacaoMySQL;
	oferta: OfertaMySQL;
}