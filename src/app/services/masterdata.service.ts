import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Insumo } from '../interfaces/insumo.interface';
import { Interlocutor } from '../interfaces/interlocutor.interface';
import { Material } from '../interfaces/material.interface';
import { Mensaje } from '../interfaces/mensaje.interface';
import { Punto } from '../interfaces/punto.interface';
import { Servicio } from '../interfaces/servicio.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { Tratamiento } from '../interfaces/tratamiento.interface';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpService) {}

  async getEmbalajes(): Promise<Embalaje[]> {
    return this.http.get<Embalaje[]>('/embalajes/get');
  }

  async getInsumos(): Promise<Insumo[]> {
    return this.http.get<Insumo[]>('/insumos/get');
  }

  async getInterlocutores(idResiduo: string): Promise<Interlocutor[]> {
    return this.http.get<Interlocutor[]>(`/mensajes/listinterlocutores/${idResiduo}`);
  }

  async getMateriales(): Promise<Material[]> {
    return this.http.get<Material[]>('/materiales/getforapp');
  }

  async getMensajes(idResiduo: string, idInterlocutor: string): Promise<Mensaje[]> {
    return this.http.get<Mensaje[]>(`/mensajes/get`);
  }

  async getPuntos(): Promise<Punto[]> {
    return this.http.get<Punto[]>('/depositos/getpuntos');
  }

  async getServicios(): Promise<Servicio[]> {
    return this.http.get<Servicio[]>('/servicios/get');
  }

  async getTerceros(): Promise<Tercero[]> {
    return this.http.get<Tercero[]>('/terceros/get');
  }

  async getTratamientos(): Promise<Tratamiento[]> {
    return this.http.get<Tratamiento[]>('/tratamientos/get');
  }

  async getVehiculos(): Promise<Vehiculo[]> {
    return this.http.get<Vehiculo[]>('/vehiculos/getautorizados');
  }

  async postEmbalaje(embalaje: Embalaje): Promise<boolean> {
    const response = await this.http.post<{ IdEmbalaje: string }>('/masterdata/embalajes', embalaje);
    embalaje.IdEmbalaje = response.IdEmbalaje;
    return true;
  }

  async postInsumo(insumo: Insumo): Promise<boolean> {
    const response = await this.http.post<{ IdInsumo: string }>('/masterdata/insumos', insumo);
    insumo.IdInsumo = response.IdInsumo;
    return true;
  }

  async postMaterial(material: Material): Promise<boolean> {
    const response = await this.http.post<{ IdMaterial: string }>('/masterdata/materiales', material);
    material.IdMaterial = response.IdMaterial;
    return true;
  }

  async postTercero(tercero: Tercero): Promise<boolean> {
    const response = await this.http.post<{ IdPersona: string }>('/masterdata/terceros', tercero);
    tercero.IdPersona = response.IdPersona;
    return true;
  }
}
