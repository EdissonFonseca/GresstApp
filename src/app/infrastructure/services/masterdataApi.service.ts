import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Package } from '../../domain/entities/package.entity';
import { Supply } from '../../domain/entities/supply.entity';
import { Material } from '../../domain/entities/material.entity';
import { Facility } from '../../domain/entities/facility.entity';
import { Service } from '../../domain/entities/service.entity';
import { Party } from '../../domain/entities/party.entity';
import { Treatment } from '../../domain/entities/treatment.entity';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { HttpService } from './http.service';
import { LoggerService } from './logger.service';

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
   * @returns {Promise<Package[]>} Array of packaging types
   */
  async getPackages(): Promise<Package[]> {
    try {
      const response = await this.http.get<Package[]>('/packages/get');
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
  async getSupplies(): Promise<Supply[]> {
    try {
      const response = await this.http.get<Supply[]>('/supplies/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting supplies', error);
      throw error;
    }
  }

  /**
   * Gets all materials
   * @returns {Promise<Material[]>} Array of materials
   */
  async getMaterials(): Promise<Material[]> {
    try {
      const response = await this.http.get<Material[]>('/materials/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting materials', error);
      throw error;
    }
  }

  /**
   * Gets all points
   * @returns {Promise<Punto[]>} Array of points
   */
  async getFacilities(): Promise<Facility[]> {
    try {
      const response = await this.http.get<Facility[]>('/facilities/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting points', error);
      throw error;
    }
  }

  /**
   * Gets all services
   * @returns {Promise<Service[]>} Array of services
   */
  async getServices(): Promise<Service[]> {
    try {
      const response = await this.http.get<Service[]>('/services/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting services', error);
      throw error;
    }
  }

  /**
   * Gets all third parties
   * @returns {Promise<Party[]>} Array of third parties
   */
  async getParties(): Promise<Party[]> {
    try {
      const response = await this.http.get<Party[]>('/parties/get');
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
  async getTreatments(): Promise<Treatment[]> {
    try {
      const response = await this.http.get<Treatment[]>('/tratamientos/get');
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
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await this.http.get<Vehicle[]>('/vehicles/');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting vehicles', error);
      throw error;
    }
  }
}
