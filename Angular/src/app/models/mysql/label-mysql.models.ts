import { Time } from "@angular/common";

export interface LabelMySQL {
    id: number;
    nome: string;
    turno: number;
    numero: number;
    inicio: Time;
    fim: Time;
}