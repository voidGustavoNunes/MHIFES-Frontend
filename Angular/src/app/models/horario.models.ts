import { Time } from "@angular/common";

export interface Horario {
    id: number;
    diaSemana: DiaSemana;
    horaInicio: Time;
    horaFim: Time;
}

export enum DiaSemana {
    SEGUNDA = 'Segunda-feira',
    TERCA = 'Terça-feira',
    QUARTA = 'Quarta-feira',
    QUINTA = 'Quinta-feira',
    SEXTA = 'Sexta-feira',
    SABADO = 'Sábado',
    DOMINGO = 'Domingo'
}