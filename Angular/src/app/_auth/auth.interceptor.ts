import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { UserAuthService } from "../_services/user-auth.service";
import { Router } from "@angular/router";
import { Injectable, NgZone } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
    
    constructor(
        private userAuthService: UserAuthService,
        private router: Router,
        private ngZone: NgZone
    ) {}
    
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
    
        if(req.headers.get("No-Auth") === "True") {
            return next.handle(req.clone());
        }

        const token = this.userAuthService.getToken();
        if(token){
            req = this.addToken(req, token);
        }

        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                    if (err.status === 403){
                        this.router.navigate(["/forbidden"]);
                    }
                    const errorMess = new Error("Você não tem permissão para realizar esta ação.");
                    return throwError(() => errorMess);
                }
            )
        );
    }

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone(
            {
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }
    
}