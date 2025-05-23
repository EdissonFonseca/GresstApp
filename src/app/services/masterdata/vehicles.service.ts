import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Vehiculo } from '@app/interfaces/vehiculo.interface';
import { STORAGE } from '@app/constants/constants';
import { LoggerService } from '@app/services/core/logger.service';

@Injectable({
  providedIn: 'root',
})
export class VehiclesService {
  private vehicles = signal<Vehiculo[]>([]);
  public vehicles$ = this.vehicles.asReadonly();

  constructor(
    private storage: StorageService,
    private readonly logger: LoggerService
  ) {
    this.loadVehicles();
  }

  private async loadVehicles() {
    try {
      const vehiculos = await this.storage.get(STORAGE.VEHICLES) as Vehiculo[];
      this.vehicles.set(vehiculos || []);
    } catch (error) {
      this.logger.error('Error loading vehicles', error);
      this.vehicles.set([]);
    }
  }

  private async saveVehicles() {
    try {
      const currentVehicles = this.vehicles();
      await this.storage.set(STORAGE.VEHICLES, currentVehicles);
    } catch (error) {
      this.logger.error('Error saving vehicles', error);
      throw error;
    }
  }

  async get(idVehiculo: string): Promise<Vehiculo | undefined> {
    return this.vehicles().find(vehiculo => vehiculo.IdVehiculo === idVehiculo);
  }

  async list(): Promise<Vehiculo[]> {
    return this.vehicles();
  }

  async create(vehiculo: Vehiculo): Promise<boolean> {
    try {
      const currentVehicles = this.vehicles();
      currentVehicles.push(vehiculo);
      this.vehicles.set(currentVehicles);
      await this.saveVehicles();
      return true;
    } catch (error) {
      this.logger.error('Error creating vehicle', { vehiculo, error });
      throw error;
    }
  }

  async update(vehiculo: Vehiculo): Promise<boolean> {
    try {
      if (!vehiculo || !vehiculo.IdVehiculo) {
        throw new Error('Vehículo no válido para actualizar');
      }

      const currentVehicles = this.vehicles();
      const index = currentVehicles.findIndex(v => v.IdVehiculo === vehiculo.IdVehiculo);
      if (index !== -1) {
        currentVehicles[index] = vehiculo;
        this.vehicles.set(currentVehicles);
        await this.saveVehicles();
      }
      return true;
    } catch (error) {
      this.logger.error('Error updating vehicle', { vehiculo, error });
      throw error;
    }
  }

  async delete(idVehiculo: string): Promise<boolean> {
    try {
      const currentVehicles = this.vehicles();
      const filteredVehicles = currentVehicles.filter(v => v.IdVehiculo !== idVehiculo);
      this.vehicles.set(filteredVehicles);
      await this.saveVehicles();
      return true;
    } catch (error) {
      this.logger.error('Error deleting vehicle', { idVehiculo, error });
      throw error;
    }
  }
}
