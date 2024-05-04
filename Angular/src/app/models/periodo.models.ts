import { PeriodoDisciplina } from "./alocacao.models";

export interface Periodo {
    id: number;
    ano: number;
    semestre: number;
    dataInicio: Date;
    dataFim: Date;
    periodoDisciplinas: Array<PeriodoDisciplina>;
    // nome: string;
    // descricao: string;
}