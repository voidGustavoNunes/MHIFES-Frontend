import { Aluno } from "./aluno.models";
import { Disciplina } from "./disciplina.models";

export interface Periodo {
    id: number;
    ano: number;
    semestre: number;
    dataInicio: Date;
    dataFim: Date;
    periodoDisciplinas: Array<PeriodoDisciplina>;
}

export interface PeriodoDisciplina {
    id: number | null;
    periodo: Periodo | null;
    disciplina: Disciplina;
    alunos: Array<Aluno>;
}

export interface PerDiscMultiSelect {
    disciplina: Disciplina | null;
    alunos: Array<Aluno> | null;
}

// nome: string;
// descricao: string;