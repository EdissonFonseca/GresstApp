import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Material } from '../interfaces/material.interface';
import { Insumo } from '../interfaces/insumo.interface';
import { Tercero } from '../interfaces/tercero.interface';

@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  private depositosUrl = `${environment.apiUrl}/depositos`;
  private embalajesUrl = `${environment.apiUrl}/embalajes`;
  private insumosUrl = `${environment.apiUrl}/insumos`;
  private materialesUrl = `${environment.apiUrl}/materiales`;
  private mensajesUrl = `${environment.apiUrl}/mensajes`;
  private serviciosUrl = `${environment.apiUrl}/servicios`;
  private tercerosUrl = `${environment.apiUrl}/terceros`;
  private tratamientosUrl = `${environment.apiUrl}/tratamientos`;
  private vehiculosUrl = `${environment.apiUrl}/vehiculos`;

  constructor() {}

  async getEmbalajes(): Promise<any> {
    const options = {
      url: `${this.embalajesUrl}/get`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getInsumos(): Promise<any> {
    const options = {
      url: `${this.insumosUrl}/get`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getInterlocutores(idResiduo: string): Promise<any> {
    const options = {
      url: `${this.mensajesUrl}/listinterlocutores/${idResiduo}`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getMateriales(): Promise<any> {
    const options = {
      url: `${this.materialesUrl}/getforapp`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getMensajes(idResiduo: string, idInterlocutor: string): Promise<any> {
    const options = {
      url: `${this.embalajesUrl}/get`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getPuntos(): Promise<any> {
    const options = {
      url: `${this.depositosUrl}/getpuntos`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getServicios(): Promise<any> {
    const options = {
      url: `${this.serviciosUrl}/get`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getTerceros(): Promise<any> {
    const options = {
      url: `${this.tercerosUrl}/get`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getTratamientos(): Promise<any> {
    const options = {
      url: `${this.tratamientosUrl}/get`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async getVehiculos(): Promise<any> {
    const options = {
      url: `${this.vehiculosUrl}/getautorizados`,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }

  async postEmbalaje(embalaje: Embalaje): Promise<boolean> {
    const options = {
      url: `${this.embalajesUrl}/post`,
      data: { Nombre: embalaje.Nombre },
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 201) {
        const embalajeCreated = response.data;
        embalaje.IdEmbalaje = embalajeCreated.IdEmbalaje;
        return true;
      }
      throw new Error('Request error');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postInsumo(insumo: Insumo): Promise<boolean> {
    const options = {
      url: `${this.insumosUrl}/post`,
      data: { Nombre: insumo.Nombre },
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 201) {
        const insumoCreated = response.data;
        insumo.IdInsumo = insumoCreated.IdInsumo;
        return true;
      }
      throw new Error('Request error');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postMaterial(material: Material): Promise<boolean> {
    const options = {
      url: `${this.materialesUrl}/post`,
      data: {
        IdMaterial: null,
        Nombre: material.Nombre,
        Medicion: material.TipoMedicion,
        Captura: material.TipoCaptura,
        Referencia: material.Referencia,
        Factor: material.Factor,
        Aprovechable: material.Aprovechable
      },
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 201) {
        const materialCreado = response.data;
        material.IdMaterial = materialCreado.IdMaterial;
        return true;
      }
      throw new Error('Request error');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postTercero(tercero: Tercero): Promise<boolean> {
    const options = {
      url: `${this.tercerosUrl}/post`,
      data: {
        IdTercero: null,
        Nombre: tercero.Nombre,
        Identificacion: tercero.Identificacion,
        Correo: tercero.Correo,
        Telefono: tercero.Telefono
      },
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 201) {
        const terceroCreado = response.data;
        tercero.IdPersona = terceroCreado.IdPersona;
        return true;
      }
      throw new Error('Request error');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }
}
