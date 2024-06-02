import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { UserAuthService } from "../_services/user-auth.service";
import { EMPTY, Observable, delay, map, of, throwError } from "rxjs";
import { UsuarioService } from "../_services/usuario.service";

@Injectable({
    providedIn: 'root'
  })
export class DataResolver implements Resolve<boolean> {

  constructor(
    private userAuthService: UserAuthService,
    private userService: UsuarioService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const roles = route.data['roles'] as Array<string>;
    let match = this.userService.roleMatch(roles);;
    console.log('dt lg ',match)
    
    return of(match);
  }
}