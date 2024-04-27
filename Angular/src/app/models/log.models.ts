import { Time } from "@angular/common";
import { Usuario } from "./usuario";

export interface Log {
    id: number;
    data: Date;
    hora: Time;
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