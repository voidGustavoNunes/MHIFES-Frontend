import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Horario } from '../models/horario.models';

@Injectable()
export class HorarioService {
  private readonly API = '/api/horarios';

  constructor(private http: HttpClient) { }

  listar(): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Horario> {
    return this.http.get<Horario>(`${this.API}/${id}`);
  }

  criar(record: Horario): Observable<Object> {
    console.log('manda', record)
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Horario): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};
