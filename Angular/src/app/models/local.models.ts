import { LocalEquipamento } from "./local-equipamento.models";

export interface Local {
    id: number;
    nome: string;
    capacidade: number;
    localEquipamentos: Array<LocalEquipamento>;
}