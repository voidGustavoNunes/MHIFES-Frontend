import { Time } from "@angular/common";
import { Local } from "./local.models";

export interface Evento {
    id: number;
    dataEvento: Date;
    descricao: string;
    horarioInicio: Time;
    horarioFim: Time;
    local: Local;
}