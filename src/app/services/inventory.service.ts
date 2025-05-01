import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { Mensaje } from '../interfaces/mensaje.interface';
import { Interlocutor } from '../interfaces/interlocutor.interface';
import { Residuo } from '../interfaces/residuo.interface';

export interface Inventario {
  IdInventario: string;
  IdResiduo: string;
  IdEstado: string;
  IdRecurso: string;
  IdServicio: string;
  Titulo: string;
  CRUD?: string;
  CRUDDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpService) {}

  async getBanco(): Promise<any> {
    return this.http.get('/inventory/banco');
  }

  async get(): Promise<Residuo[]> {
    return this.http.get<Residuo[]>('/inventory/get');
  }

  async getMensajes(idResiduo: string, idInterlocutor: string): Promise<Mensaje[]> {
    return this.http.get<Mensaje[]>(`/inventory/mensajes/${idResiduo}/${idInterlocutor}`);
  }

  async getInterlocutores(idResiduo: string): Promise<Interlocutor[]> {
    return this.http.get<Interlocutor[]>(`/inventory/interlocutores/${idResiduo}`);
  }

  async post(inventario: Inventario): Promise<boolean> {
    const response = await this.http.post<{ IdInventario: string }>('/inventory/post', inventario);
    inventario.IdInventario = response.IdInventario;
    return true;
  }

  async patch(inventario: Inventario): Promise<boolean> {
    await this.http.patch('/inventory/patch', inventario);
    return true;
  }
}
