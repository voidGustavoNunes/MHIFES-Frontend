import { Injectable } from '@angular/core';
import { Equipamento } from '../models/equipamento.models';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
    
@Injectable()
export class EquipamentoService {
  private readonly API = '/api/equipamentos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Equipamento[]> {
    return this.http.get<Equipamento[]>(`${this.API}`);
  }

  buscarPorId(id: number): Observable<Equipamento> {
    return this.http.get<Equipamento>(`${this.API}/${id}`);
  }

  criar(record: Equipamento[]): Observable<Object> {
    return this.http.post(`${this.API}`, record);
  }

  atualizar(id: number, record: Equipamento[]): Observable<Object> {
    return this.http.put(`${this.API}/${id}`, record);
  }

  excluir(id: number): Observable<Object> {
    return this.http.delete(`${this.API}/${id}`, {observe: 'response'});
  }
};