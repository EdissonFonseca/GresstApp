import { Injectable, signal } from "@angular/core";
import { Residuo } from "../../interfaces/residuo.interface";
import { Actividad } from "../../interfaces/actividad.interface";
import { Cuenta } from "../../interfaces/cuenta.interface";
import { StorageService } from "../core/storage.service";
import { CRUD_OPERATIONS, SERVICE_TYPES, STORAGE } from "../../constants/constants";
import { MaterialsService } from "../masterdata/materials.service";
import { PointsService } from "../masterdata/points.service";
import { ThirdpartiesService } from "../masterdata/thirdparties.service";
import { Utils } from "@app/utils/utils";
import { LoggerService } from "../core/logger.service";

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private inventory = signal<Residuo[]>([]);
  private account = signal<Cuenta | null>(null);
  private activities = signal<Actividad[]>([]);
  public inventory$ = this.inventory.asReadonly();

  constructor(
    private storage: StorageService,
    private materialsService: MaterialsService,
    private thirdpartiesService: ThirdpartiesService,
    private pointsService: PointsService,
    private readonly logger: LoggerService
  ) {
    this.loadData();
  }

  private async loadData() {
    try {
      const cuenta = await this.storage.get(STORAGE.ACCOUNT) as Cuenta;
      const actividades = await this.storage.get(STORAGE.ACTIVITIES) as Actividad[];
      const residuos = await this.storage.get(STORAGE.INVENTORY) as Residuo[];

      this.account.set(cuenta);
      this.activities.set(actividades || []);
      this.inventory.set(residuos || []);
    } catch (error) {
      this.logger.error('Error loading inventory data', error);
      this.inventory.set([]);
      this.activities.set([]);
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

  async list(): Promise<Residuo[]> {
    try {
      const residuos = this.inventory();
      const materiales = await this.materialsService.list();
      const terceros = await this.thirdpartiesService.list();
      const puntos = await this.pointsService.list();
      const actividades = this.activities();

      if (!residuos || residuos.length === 0) return residuos;

      return residuos.map(residuo => {
        const material = materiales.find(x => x.IdMaterial === residuo.IdMaterial);
        const tercero = terceros.find(x => x.IdPersona === residuo.IdPropietario);
        const punto = puntos.find(x => x.IdDeposito === residuo.IdDepositoOrigen);
        let ubicacion = '';
        let cantidades = '';

        if (material) {
          residuo.Material = material.Nombre;
          residuo.Aprovechable = material.Aprovechable;
        }
        if (tercero) {
          residuo.Propietario = tercero.Nombre;
        }
        if (punto) {
          residuo.DepositoOrigen = punto.Nombre;
        }
        if (residuo.IdDeposito) {
          const deposito = puntos.find(x => x.IdDeposito === residuo.IdDeposito);
          if (deposito) {
            ubicacion = deposito.Nombre;
          }
        } else if (residuo.IdVehiculo) {
          ubicacion = residuo.IdVehiculo;
        } else if (residuo.IdRuta) {
          const actividad = actividades.find(x => x.IdServicio === SERVICE_TYPES.COLLECTION && x.IdRecurso === residuo.IdRuta);
          if (actividad) {
            ubicacion = actividad.Titulo;
          }
        }
        residuo.Ubicacion = ubicacion;

        if (residuo.Cantidad ?? 0 > 0) {
          cantidades += `${residuo.Cantidad} ${Utils.quantityUnit}`;
        }
        if (residuo.Peso ?? 0 > 0) {
          if (cantidades !== '') {
            cantidades += `/${residuo.Peso} ${Utils.weightUnit}`;
          } else {
            cantidades = `${residuo.Peso} ${Utils.weightUnit}`;
          }
        }
        if (residuo.Volumen ?? 0 > 0) {
          if (cantidades !== '') {
            cantidades += `/${residuo.Volumen} ${Utils.volumeUnit}`;
          } else {
            cantidades = `${residuo.Volumen} ${Utils.volumeUnit}`;
          }
        }
        residuo.Cantidades = cantidades;

        return residuo;
      });
    } catch (error) {
      this.logger.error('Error listing inventory', error);
      throw error;
    }
  }

  async getResidue(idResiduo: string): Promise<Residuo | undefined> {
    try {
      const residuos = await this.list();
      return residuos.find(x => x.IdResiduo === idResiduo);
    } catch (error) {
      this.logger.error('Error getting residuo', { idResiduo, error });
      throw error;
    }
  }

  async createResidue(residuo: Residuo): Promise<boolean> {
    try {
      const currentInventory = this.inventory();
      currentInventory.push(residuo);
      this.inventory.set(currentInventory);
      await this.saveInventory();
      return true;
    } catch (error) {
      this.logger.error('Error creating residuo', { residuo, error });
      throw error;
    }
  }

  async updateResidue(residuo: Residuo): Promise<boolean> {
    try {
      const currentInventory = this.inventory();
      const residuoStorage = currentInventory.find(item => item.IdResiduo === residuo.IdResiduo);

      if (residuoStorage) {
        residuoStorage.CRUD = CRUD_OPERATIONS.UPDATE;
        residuoStorage.IdEstado = residuo.IdEstado;
        residuoStorage.Cantidad = residuo.Cantidad;
        residuoStorage.CantidadEmbalaje = residuo.CantidadEmbalaje;
        residuoStorage.IdEmbalaje = residuo.IdEmbalaje;
        residuoStorage.Peso = residuo.Peso;
        residuoStorage.IdDeposito = residuo.IdDeposito;

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
      const filteredInventory = currentInventory.filter(item => item.IdResiduo !== idResiduo);
      this.inventory.set(filteredInventory);
      await this.saveInventory();
      return true;
    } catch (error) {
      this.logger.error('Error deleting residuo', { idResiduo, error });
      throw error;
    }
  }
}

