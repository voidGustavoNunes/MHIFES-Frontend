import { Time } from "@angular/common";
import { Local } from "./local.models";
import { Horario } from "./horario.models";

export interface Evento {
    id: number;
    dataEvento: Date;
    descricao: string;
    horario: Horario;
    // horarioInicio: Time;
    // horarioFim: Time;
    local: Local;
}