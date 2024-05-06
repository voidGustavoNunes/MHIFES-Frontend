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

    private setTime() {
        if (localStorage) {
            const expirationTime = Date.now() + 2 * 60 * 60 * 1000;
            this.localStorage.setItem("expiration_time", expirationTime);
        }
    }

    private getTime() {
        if (localStorage) {
            const expirationTime = this.localStorage.getItem("expiration_time");
            // const expirationTime = sessionStorage.getItem("expiration_time");
            if (Date.now() <= expirationTime) {
                return true;
            } else {
                return false;
            }
        }
        return;
    }

    public setRole(roles: string) {
        if (localStorage) {
            this.localStorage.setItem("role", JSON.stringify(roles));
            // sessionStorage.setItem("role", JSON.stringify(roles));
        }
    }

    public getRole(): string {
        if (localStorage) {
            if(this.getTime()) {
                const storedRole = this.localStorage.getItem("role");
                // const storedRole = sessionStorage.getItem("role");
                return storedRole ? JSON.parse(storedRole) : '';
            } else {
                this.clear();
            }
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
            if(this.getTime()) {
                return this.localStorage.getItem("jwtToken") ?? '';
                // return sessionStorage.getItem("jwtToken") ?? '';
            } else {
                this.clear();
            }
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
            if(this.getTime()) {
                return this.localStorage.getItem("nome") ?? '';
                // return sessionStorage.getItem("nome") ?? '';
            } else {
                this.clear();
            }
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