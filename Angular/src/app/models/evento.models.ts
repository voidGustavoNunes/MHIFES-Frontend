import { Local } from "./local.models";

export interface Evento {
    id: number;
    intervaloData: Array<Date>;
    descricao: string;
    local: Local;
}