import { Usuario } from "./usuario";

export interface Log {
    id: number;
    data: Date;
    descricao: string;
    operacao: Operacao;
    idRegistro: number;
    usuario: Usuario;
}

export enum Operacao {
    INCLUSAO = "Inclusão",
    ALTERACAO = "Alteração",
    EXCLUSAO = "Exclusão"
}
