import { Injectable, signal } from "@angular/core";
import { Waste } from "../../domain/entities/waste.entity";
import { Process } from "@app/domain/entities/process.entity";
import { Account } from "../../domain/entities/account.entity";
import { StorageService } from "../services/storage.service";
import { CRUD_OPERATIONS, SERVICE_TYPES, STORAGE } from "../../core/constants";
import { MaterialRepository } from "./material.repository";
import { FacilityRepository } from "./facility.repository";
import { PartyRepository } from "./party.repository";
import { Utils } from "@app/core/utils";
import { LoggerService } from "../services/logger.service";

@Injectable({
  providedIn: 'root',
})
export class InventoryRepository {
  private inventory = signal<Waste[]>([]);
  private account = signal<Account | null>(null);
  private processes = signal<Process[]>([]);
  public inventory$ = this.inventory.asReadonly();

  constructor(
    private storage: StorageService,
    private materialRepository: MaterialRepository,
    private partiesService: PartyRepository,
    private facilityRepository: FacilityRepository,
    private readonly logger: LoggerService
  ) {
    this.loadData();
  }

  private async loadData() {
    try {
      const account = await this.storage.get(STORAGE.ACCOUNT) as Account;
      const actividades = await this.storage.get(STORAGE.OPERATION) as Process[];
      const residuos = await this.storage.get(STORAGE.INVENTORY) as Waste[];

      this.account.set(account);
      this.processes.set(actividades || []);
      this.inventory.set(residuos || []);
    } catch (error) {
      this.logger.error('Error loading inventory data', error);
      this.inventory.set([]);
      this.processes.set([]);
    }
  }

  private async saveInventory() {
    try {
      const currentInventory = this.inventory();
      await this.storage.set(STORAGE.INVENTORY, currentInventory);
    } catch (error) {
      this.logger.error('Error saving inventory', error);
      throw error;
    }
  }

  async list(): Promise<Waste[]> {
    try {
      const residuos = this.inventory();
      const materiales = await this.materialRepository.getAll();
      const terceros = await this.partiesService.getAll();
      const facilities = await this.facilityRepository.getAll();
      const processes = this.processes();

      if (!residuos || residuos.length === 0) return residuos;

      return residuos.map(residuo => {
        const material = materiales.find(x => x.Id === residuo.MaterialId);
        const tercero = terceros.find(x => x.Id === residuo.OwnerId);
        const facility = facilities.find(x => x.Id === residuo.OriginFacilityId);
        let ubicacion = '';
        let cantidades = '';

        if (material) {
          residuo.MaterialName = material.Name;
          residuo.IsRecyclable = material.IsRecyclable;
        }
        if (tercero) {
          residuo.OwnerName = tercero.Name;
        }
        if (facility) {
          residuo.OriginFacilityName = facility.Name;
        }
        if (residuo.FacilityId) {
          const facility = facilities.find(x => x.Id === residuo.FacilityId);
          if (facility) {
              ubicacion = facility.Name;
          }
        } else if (residuo.VehicleId) {
          ubicacion = residuo.VehicleId;
        } else if (residuo.RouteId) {
          const process = processes.find(x => x.ServiceId === SERVICE_TYPES.COLLECTION && x.ResourceId === residuo.RouteId);
          if (process) {
            ubicacion = process.Title;
          }
        }
        residuo.LocationName = ubicacion;

        if (residuo.Quantity ?? 0 > 0) {
          cantidades += `${residuo.Quantity} ${Utils.quantityUnit}`;
        }
        if (residuo.Weight ?? 0 > 0) {
          if (cantidades !== '') {
            cantidades += `/${residuo.Weight} ${Utils.weightUnit}`;
          } else {
            cantidades = `${residuo.Weight} ${Utils.weightUnit}`;
          }
        }
        if (residuo.Volume ?? 0 > 0) {
          if (cantidades !== '') {
            cantidades += `/${residuo.Volume} ${Utils.volumeUnit}`;
          } else {
            cantidades = `${residuo.Volume} ${Utils.volumeUnit}`;
          }
        }
        residuo.QuantitiesName = cantidades;

        return residuo;
      });
    } catch (error) {
      this.logger.error('Error listing inventory', error);
      throw error;
    }
  }

  async getResidue(idResiduo: string): Promise<Waste | undefined> {
    try {
      const residuos = await this.list();
      return residuos.find(x => x.Id === idResiduo);
    } catch (error) {
      this.logger.error('Error getting residuo', { idResiduo, error });
      throw error;
    }
  }

  async createResidue(residuo: Waste): Promise<boolean> {
    try {
      const inventory = this.inventory();
      inventory.push(residuo);
      this.inventory.set(inventory);
      await this.saveInventory();
      return true;
    } catch (error) {
      this.logger.error('Error creating residuo', { residuo, error });
      throw error;
    }
  }

    async updateResidue(residuo: Waste): Promise<boolean> {
    try {
      const currentInventory = this.inventory();
      const residuoStorage = currentInventory.find(item => item.Id === residuo.Id);

      if (residuoStorage) {
        residuoStorage.CRUD = CRUD_OPERATIONS.UPDATE;
        residuoStorage.StatusId = residuo.StatusId;
        residuoStorage.Quantity = residuo.Quantity;
        residuoStorage.PackageQuantity = residuo.PackageQuantity;
        residuoStorage.PackageId = residuo.PackageId;
        residuoStorage.Weight = residuo.Weight;
        residuoStorage.FacilityId = residuo.FacilityId;
        residuoStorage.OriginFacilityId = residuo.OriginFacilityId;
        residuoStorage.MaterialId = residuo.MaterialId;
        residuoStorage.OwnerId = residuo.OwnerId;
        residuoStorage.RouteId = residuo.RouteId;
        residuoStorage.TreatmentId = residuo.TreatmentId;
        residuoStorage.VehicleId = residuo.VehicleId;
        residuoStorage.EntryDate = residuo.EntryDate;
        residuoStorage.Image = residuo.Image;
        residuoStorage.Price = residuo.Price;
        residuoStorage.IsPublic = residuo.IsPublic;
        residuoStorage.RequestName = residuo.RequestName;
        residuoStorage.LocationName = residuo.LocationName;
        residuoStorage.Volume = residuo.Volume;

        this.inventory.set(currentInventory);
        await this.saveInventory();
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Error updating residuo', { residuo, error });
      throw error;
    }
  }

  async deleteResidue(idResiduo: string): Promise<boolean> {
    try {
      const currentInventory = this.inventory();
      const filteredInventory = currentInventory.filter(item => item.Id !== idResiduo);
      this.inventory.set(filteredInventory);
      await this.saveInventory();
      return true;
    } catch (error) {
      this.logger.error('Error deleting residuo', { idResiduo, error });
      throw error;
    }
  }
}

