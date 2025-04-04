import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class UserAuthService {
    private localStorage!: any;

    
    constructor(
        private router: Router,
        @Inject(DOCUMENT) private document: Document
        ) {
            this.localStorage = this.document.defaultView?.localStorage;
         }

    public setTime() {
        if (this.localStorage) {
            const expirationTime = Date.now() + 2 * 60 * 60 * 1000;
            this.localStorage.setItem("expiration_time", expirationTime);
        }
    }

    public getTime() {
        if (this.localStorage) {
            const expirationTime = this.localStorage.getItem("expiration_time");
            // const expirationTime = sessionStorage.getItem("expiration_time");
            if (Date.now() <= expirationTime) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public setRole(role: string) {
        if (this.localStorage) {
            this.localStorage.setItem("role", JSON.stringify(role));
            // sessionStorage.setItem("role", JSON.stringify(role));
        }
    }

    public getRole(): string {
        if (this.localStorage) {
                const storedRole = this.localStorage.getItem("role");
                // const storedRole = sessionStorage.getItem("role");
                return storedRole ? JSON.parse(storedRole) : '';
        }
        return '';
    }

    public setToken(jwtToken: string) {
        if (this.localStorage) {
            this.localStorage.setItem("jwtToken", jwtToken);
            // sessionStorage.setItem("jwtToken", jwtToken);
        }
    }

    public getToken(): string {
        if (this.localStorage) {
                return this.localStorage.getItem("jwtToken") ?? '';
                // return sessionStorage.getItem("jwtToken") ?? '';
        }
        return '';
    }

    public setNome(user: string) {
        if (this.localStorage) {
            this.localStorage.setItem("nome", user);
            // sessionStorage.setItem("nome", user);
        }
    }

    public getNome(): string {
        if (this.localStorage) {
                return this.localStorage.getItem("nome") ?? '';
                // return sessionStorage.getItem("nome") ?? '';
        }
        return '';
    }

    public setLogin(login: string) {
        if (this.localStorage) {
            this.localStorage.setItem("matricula", login);
            // sessionStorage.setItem("matricula", login);
        }
    }

    public getLogin(): string {
        if (this.localStorage) {
                return this.localStorage.getItem("matricula") ?? '';
                // return sessionStorage.getItem("matricula") ?? '';
        }
        return '';
    }

    public clear() {
        if (this.localStorage) {
            this.localStorage.clear();
            // sessionStorage.clear();
            this.router.navigate(['/login']).then(() => {
            window.location.reload();
            });
        }
    }

    public isLoggedIn() {
        if (this.localStorage && this.getTime()) {
            return this.getRole() && this.getToken();
        }
        return false;
    }
}