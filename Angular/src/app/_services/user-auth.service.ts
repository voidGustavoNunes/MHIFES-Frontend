import { Injectable } from "@angular/core";

@Injectable()
export class UserAuthService {

    constructor() { }

    public setRole(roles: string) {
        // if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem("role", JSON.stringify(roles));
        // }
    }

    public getRole(): string {
        // if (typeof window !== 'undefined' && window.localStorage) {
            // return JSON.parse(localStorage.getItem("role") ?? '');
            const storedRole = localStorage.getItem("role");
        return storedRole ? JSON.parse(storedRole) : '';
        // }
        // return '';
    }

    public setToken(jwtToken: string) {
        // if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem("jwtToken", jwtToken);
        // }
    }

    public getToken(): string {
        // if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem("jwtToken") ?? '';
        // }
        // return '';
    }

    public setNome(user: string) {
        // if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem("nome", user);
        // }
    }

    public getNome(): string {
        // if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem("nome") ?? '';
        // }
        // return '';
    }

    public clear() {
        // if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.clear();
        // }
    }

    public isLoggedIn() {
        return this.getRole() && this.getToken();
    }
}