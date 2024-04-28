import { Time } from "@angular/common";
import { Local } from "./local.models";
import { Horario } from "./horario.models";

export interface Evento {
    id: number;
    nome: string;
    dataEvento: Date;
    descricao: string;
    horario: Horario;
    // horarioInicio: Time;
    // horarioFim: Time;
    local: Local;
}

export interface EventoHourData {
    dataEvento: Date;
    horario: Horario;
    // horarioInicio: Time;
    // horarioFim: Time;
}
