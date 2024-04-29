import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserAuthService } from '../_services/user-auth.service';
import { UsuarioService } from '../_services/usuario.service';
// import { AuthService } from '../_services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private userAuthService: UserAuthService,
    private router: Router,
    private userService: UsuarioService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.userAuthService.getToken() !== null) {
      // const role = route.data["role"] as string;
      // const roles = route.data["roles"] as string[];
      const roles = route.data['roles'] as Array<string>;
      
      if (roles) {
        const match = this.userService.roleMatch(roles);
      // if(role) {
      //   const match = this.userService.roleMatch(role);
        
        if(match) {
          return true;
        } else {
          this.router.navigate(['/forbidden']);
          return false;
        }
      }
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}