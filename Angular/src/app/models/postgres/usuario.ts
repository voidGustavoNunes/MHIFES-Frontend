export interface Usuario {
    id: number;
    login: string;
    nome: string;
    password: string;
    role: UserRole;
}

export interface AutheticationDTO {
    login: string;
    password: string;
}

export interface RegisterDTO {
    login: string;
    nome: string;
    password: string;
    role: UserRole;
}

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
}

export interface LoginResponseDTO {
    token: string;
    login: string;
    nome: string;
    role: UserRole;
}