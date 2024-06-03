import { TurmaMySQL } from "./turma-mysql.models";

export interface OfertaMySQL {
	id: number;
	ano: number;
	semestre: number;
	tempoMaximoTrabalho: number;
	intervaloMinimo: number;
	publica: boolean;
	turma: TurmaMySQL;
}