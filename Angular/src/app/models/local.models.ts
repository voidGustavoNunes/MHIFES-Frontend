import { Equipamento } from "./equipamento.models";

export interface Local {
    id: number;
    nome: string;
    capacidade: number;
    equipamentos: Array<Equipamento>;
}