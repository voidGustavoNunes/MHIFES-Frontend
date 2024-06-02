import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
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
    if (this.userAuthService.getToken() !== null && this.userAuthService.getToken()) {
      const roles = route.data['roles'] as Array<string>;
      
      if (!roles || roles.length === 0) {
        return true;
      }

      return this.userService.roleMatch(roles);
      // if (roles && roles.length > 0) {
      //   return this.userService.roleMatch(roles);
      // } else {
      //   return true;
      // }
    }
    
    // alert('eh para vir daqui')
    this.router.navigate(['/forbidden']);
    // window.scrollTo(0, 0);
    return false;
  }
}