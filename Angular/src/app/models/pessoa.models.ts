export interface Pessoa {
    // id: number;
    // nome: string;
    // curso: string;
    nomeUser: string;
    matricula: string;
    senha: string;
}
export interface UsuarioPadrao {
    id: number;
    nomeUser: string;
    matricula: string;
    senha: string;
}

export interface LoginUser {
    matricula: string;
    senha: string;
}

export interface Usuario {
    nomeUser: string;
    tipo: number;
}