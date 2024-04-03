import { Equipamento } from "./equipamento.models";

export interface Local {
    id: number;
    nome: string;
    capacidade: number;
    localEquipamentos: Array<LocalEquipamento>;
}

export interface LocalEquipamento {
    id: number | null;
    local: Local | null;
    equipamento: Equipamento | null;
    quantidade: number | null;
}

export interface LocalEquipMultiSelect {
    equipamento: Equipamento;
    quantidade: number;
}

export interface LocalDTO {
    local: Local;
    localEquipamentos: Array<LocalEquipamento>;
}