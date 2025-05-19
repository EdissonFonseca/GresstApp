import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Embalaje } from '../../interfaces/embalaje.interface';
import { Insumo } from '../../interfaces/insumo.interface';
import { Interlocutor } from '../../interfaces/interlocutor.interface';
import { Material } from '../../interfaces/material.interface';
import { Mensaje } from '../../interfaces/mensaje.interface';
import { Punto } from '../../interfaces/punto.interface';
import { Servicio } from '../../interfaces/servicio.interface';
import { Tercero } from '../../interfaces/tercero.interface';
import { Tratamiento } from '../../interfaces/tratamiento.interface';
import { Vehiculo } from '../../interfaces/vehiculo.interface';
import { HttpService } from './http.service';
import { LoggerService } from '../core/logger.service';

@Injectable({
  providedIn: 'root'
})
export class MasterDataApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpService,
    private logger: LoggerService
  ) {}

  /**
   * Gets all packaging types
   * @returns {Promise<Embalaje[]>} Array of packaging types
   */
  async getPackaging(): Promise<Embalaje[]> {
    try {
      const response = await this.http.get<Embalaje[]>('/embalajes/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting packaging types', error);
      throw error;
    }
  }

  /**
   * Gets all supplies
   * @returns {Promise<Insumo[]>} Array of supplies
   */
  async getSupplies(): Promise<Insumo[]> {
    try {
      const response = await this.http.get<Insumo[]>('/insumos/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting supplies', error);
      throw error;
    }
  }

  /**
   * Gets counterparts for a specific inventory item
   * @param {string} idResiduo - Inventory item ID
   * @returns {Promise<Interlocutor[]>} Array of counterparts
   */
  async getCounterparts(idResiduo: string): Promise<Interlocutor[]> {
    try {
      const response = await this.http.get<Interlocutor[]>(`/mensajes/listinterlocutores/${idResiduo}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting counterparts', { idResiduo, error });
      throw error;
    }
  }

  /**
   * Gets all materials
   * @returns {Promise<Material[]>} Array of materials
   */
  async getMaterials(): Promise<Material[]> {
    try {
      const response = await this.http.get<Material[]>('/materiales/getforapp');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting materials', error);
      throw error;
    }
  }

  /**
   * Gets messages for a specific inventory item and counterpart
   * @param {string} idResiduo - Inventory item ID
   * @param {string} idInterlocutor - Counterpart ID
   * @returns {Promise<Mensaje[]>} Array of messages
   */
  async getMessages(idResiduo: string, idInterlocutor: string): Promise<Mensaje[]> {
    try {
      const response = await this.http.get<Mensaje[]>(`/mensajes/get`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting messages', { idResiduo, idInterlocutor, error });
      throw error;
    }
  }

  /**
   * Gets all points
   * @returns {Promise<Punto[]>} Array of points
   */
  async getPoints(): Promise<Punto[]> {
    try {
      const response = await this.http.get<Punto[]>('/depositos/getpuntos');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting points', error);
      throw error;
    }
  }

  /**
   * Gets all services
   * @returns {Promise<Servicio[]>} Array of services
   */
  async getServices(): Promise<Servicio[]> {
    try {
      const response = await this.http.get<Servicio[]>('/servicios/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting services', error);
      throw error;
    }
  }

  /**
   * Gets all third parties
   * @returns {Promise<Tercero[]>} Array of third parties
   */
  async getThirdParties(): Promise<Tercero[]> {
    try {
      const response = await this.http.get<Tercero[]>('/terceros/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting third parties', error);
      throw error;
    }
  }

  /**
   * Gets all treatments
   * @returns {Promise<Tratamiento[]>} Array of treatments
   */
  async getTreatments(): Promise<Tratamiento[]> {
    try {
      const response = await this.http.get<Tratamiento[]>('/tratamientos/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting treatments', error);
      throw error;
    }
  }

  /**
   * Gets all authorized vehicles
   * @returns {Promise<Vehiculo[]>} Array of vehicles
   */
  async getVehicles(): Promise<Vehiculo[]> {
    try {
      const response = await this.http.get<Vehiculo[]>('/vehiculos/getautorizados');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting vehicles', error);
      throw error;
    }
  }

  /**
   * Creates a new packaging type
   * @param {Embalaje} packaging - Packaging to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createPackage(packaging: Embalaje): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdEmbalaje: string }>('/masterdata/embalajes', packaging);
      if (response.status === 201 && response.data) {
        packaging.IdEmbalaje = response.data.IdEmbalaje;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating packaging', { packaging, error });
      throw error;
    }
  }

  /**
   * Creates a new packaging type
   * @param {Embalaje} packaging - Packaging to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createPoint(point: Punto): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdPunto: string }>('/masterdata/puntos', point);
      if (response.status === 201 && response.data) {
        point.IdDeposito = response.data.IdPunto;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating point', { point, error });
      throw error;
    }
  }

  async updatePoint(point: Punto): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdPunto: string }>('/masterdata/puntos', point);
      if (response.status === 201 && response.data) {
        point.IdDeposito = response.data.IdPunto;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating point', { point, error });
      throw error;
    }
  }

  /**
   * Creates a new supply
   * @param {Insumo} supply - Supply to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createSupply(supply: Insumo): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdInsumo: string }>('/masterdata/insumos', supply);
      if (response.status === 201 && response.data) {
        supply.IdInsumo = response.data.IdInsumo;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating supply', { supply, error });
      throw error;
    }
  }

  async updateSupply(supply: Insumo): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdInsumo: string }>('/masterdata/insumos', supply);
      if (response.status === 201 && response.data) {
        supply.IdInsumo = response.data.IdInsumo;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating supply', { supply, error });
      throw error;
    }
  }

  /**
   * Creates a new material
   * @param {Material} material - Material to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createMaterial(material: Material): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdMaterial: string }>('/masterdata/materiales', material);
      if (response.status === 201 && response.data) {
        material.IdMaterial = response.data.IdMaterial;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating material', { material, error });
      throw error;
    }
  }

  /**
   * Creates a new third party
   * @param {Tercero} thirdParty - Third party to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createThirdParty(thirdParty: Tercero): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdPersona: string }>('/masterdata/terceros', thirdParty);
      if (response.status === 201 && response.data) {
        thirdParty.IdPersona = response.data.IdPersona;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating third party', { thirdParty, error });
      throw error;
    }
  }
  async updateThirdParty(thirdParty: Tercero): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdPersona: string }>('/masterdata/terceros', thirdParty);
      if (response.status === 201 && response.data) {
        thirdParty.IdPersona = response.data.IdPersona;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating third party', { thirdParty, error });
      throw error;
    }
  }

  /**
   * Creates a new material
   * @param {Material} material - Material to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async updateMaterial(material: Material): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdMaterial: string }>('/masterdata/materiales', material);
      if (response.status === 201 && response.data) {
        material.IdMaterial = response.data.IdMaterial;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating material', { material, error });
      throw error;
    }
  }

  async updatePackage(embalaje: Embalaje): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdEmbalaje: string }>('/masterdata/embalajes', embalaje);
      if (response.status === 201 && response.data) {
        embalaje.IdEmbalaje = response.data.IdEmbalaje;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating material', { embalaje, error });
      throw error;
    }
  }

  async createTreatment(treatment: Tratamiento): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdTratamiento: string }>('/masterdata/tratamientos', treatment);
      if (response.status === 201 && response.data) {
        treatment.IdTratamiento = response.data.IdTratamiento;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating material', { treatment, error });
      throw error;
    }
  }
  async updateTreatment(treatment: Tratamiento): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdTratamiento: string }>('/masterdata/tratamientos', treatment);
      if (response.status === 201 && response.data) {
        treatment.IdTratamiento = response.data.IdTratamiento;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating material', { treatment, error });
      throw error;
    }
  }
}
