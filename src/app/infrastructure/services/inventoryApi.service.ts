import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from './http.service';
import { Waste } from '@app/domain/entities/waste.entity';
import { LoggerService } from './logger.service';

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

/**
 * Interface representing an inventory item
 */
export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  category: string;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  lastUpdated: Date;
  createdAt: Date;
}

/**
 * Interface representing the response from the inventory API
 */
export interface InventoryResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpService,
    private logger: LoggerService
  ) {}

  /**
   * Gets bank information
   * @returns {Promise<any>} Bank data
   */
  async getBank(): Promise<any> {
    try {
      const response = await this.http.get('/appinventory/banco');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting bank information', error);
      throw error;
    }
  }

  /**
   * Gets all inventory items
   * @returns {Promise<Waste[]>} Array of inventory items
   */
  async get(): Promise<Waste[]> {
    try {
      const response = await this.http.get<Waste[]>('/appinventory/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting inventory items', error);
      throw error;
    }
  }

  /**
   * Creates a new inventory item
   * @param {Inventario} inventario - Inventory item to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async create(inventario: Inventario): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdInventario: string }>('/appinventory/post', inventario);
      if (response.status === 201 && response.data) {
        inventario.IdInventario = response.data.IdInventario;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error creating inventory item', { inventario, error });
      throw error;
    }
  }

  /**
   * Updates an existing inventory item
   * @param {Inventario} inventario - Inventory item to update
   * @returns {Promise<boolean>} True if update successful
   */
  async update(inventario: Inventario): Promise<boolean> {
    try {
      const response = await this.http.post('/appinventory/patch', inventario);
      return response.status === 200;
    } catch (error) {
      this.logger.error('Error updating inventory item', { inventario, error });
      throw error;
    }
  }
}
