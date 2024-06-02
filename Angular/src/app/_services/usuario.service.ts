import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutheticationDTO, LoginResponseDTO, RegisterDTO } from '../models/usuario';
import { UserAuthService } from './user-auth.service';

@Injectable()
export class UsuarioService {
  private readonly API = '/api/auth';
  // private readonly API = 'http://localhost:8080/auth';

  requestHeader = new HttpHeaders(
    {"No-Auth":"True"}
  );

  constructor(
    private http: HttpClient,
    private userAuthService: UserAuthService,
  ) { }

  login(record: AutheticationDTO): Observable<Object> {
    return this.http.post<LoginResponseDTO>(`${this.API}/login`, record, {headers: this.requestHeader});
  }

  register(record: RegisterDTO): Observable<Object> {
    return this.http.post<RegisterDTO>(`${this.API}/register`, record);
  }

  roleMatch(allowedRoles: any[]): boolean {
    const userRole: any = this.userAuthService.getRole();

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    } else {
      return false;
    }
  }

};
