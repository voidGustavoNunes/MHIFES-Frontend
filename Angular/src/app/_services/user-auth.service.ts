import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable()
export class UserAuthService {
    private localStorage!: any;
    
    constructor(private router: Router,
        @Inject(DOCUMENT) private document: Document
        ) {
            this.localStorage = this.document.defaultView?.localStorage;
         }

    public setRole(roles: string) {
        if (localStorage) {
            this.localStorage.setItem("role", JSON.stringify(roles));
            // sessionStorage.setItem("role", JSON.stringify(roles));
        }
    }

    public getRole(): string {
        if (localStorage) {
            const storedRole = this.localStorage.getItem("role");
        // const storedRole = sessionStorage.getItem("role");
        return storedRole ? JSON.parse(storedRole) : '';
    }
        return '';
    }

    public setToken(jwtToken: string) {
        if (localStorage) {
            this.localStorage.setItem("jwtToken", jwtToken);
            // sessionStorage.setItem("jwtToken", jwtToken);
        }
    }

    public getToken(): string {
        if (localStorage) {
            return this.localStorage.getItem("jwtToken") ?? '';
            // return sessionStorage.getItem("jwtToken") ?? '';
        }
        return '';
    }

    public setNome(user: string) {
        if (localStorage) {
            this.localStorage.setItem("nome", user);
            // sessionStorage.setItem("nome", user);
        }
    }

    public getNome(): string {
        if (localStorage) {
                return this.localStorage.getItem("nome") ?? '';
            // return sessionStorage.getItem("nome") ?? '';
        }
        return '';
    }

    public clear() {
        this.localStorage.clear();
        // sessionStorage.clear();
        this.router.navigate(['/home']).then(() => {
          window.location.reload();
        });
    }

    public isLoggedIn() {
        return this.getRole() && this.getToken();
    }
}