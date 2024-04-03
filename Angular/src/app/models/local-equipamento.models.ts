import { Equipamento } from "./equipamento.models";
import { Local } from "./local.models";

export interface LocalEquipamento {
    id: number;
    local?: Local;
    equipamento: Equipamento;
    quantidade: number;
}

export interface LocalEquipMultiSelect {
    equipamento: Equipamento;
    quantidade: number;
}