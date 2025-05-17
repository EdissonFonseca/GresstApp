import { Injectable } from "@angular/core";
import { Residuo } from "../../interfaces/residuo.interface";
import { Actividad } from "../../interfaces/actividad.interface";
import { Cuenta } from "../../interfaces/cuenta.interface";
import { StorageService } from "../core/storage.service";
import { CRUD_OPERATIONS, SERVICE_TYPES } from "../../constants/constants";
import { MaterialsService } from "../masterdata/materials.service";
import { PointsService } from "../masterdata/points.service";
import { ThirdpartiesService } from "../masterdata/thirdparties.service";
import { Utils } from "@app/utils/utils";

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(
    private storage: StorageService,
    private materialsService: MaterialsService,
    private thirdpartiesService: ThirdpartiesService,
    private pointsService: PointsService
  ) {}

  async list(): Promise<Residuo[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const residuos: Residuo[] = await this.storage.get('Inventario');
    const materiales = await this.materialsService.list();
    const terceros = await this.thirdpartiesService.list();
    const puntos = await this.pointsService.list();
    let ubicacion: string = '';
    let cantidades: string = '';

    if(!residuos || residuos.length == 0) return residuos;

    residuos.forEach((residuo) => {
      const material = materiales.find((x) => x.IdMaterial == residuo.IdMaterial);
      const tercero = terceros.find(x => x.IdPersona == residuo.IdPropietario);
      const punto = puntos.find(x => x.IdDeposito == residuo.IdDepositoOrigen);
      ubicacion = '';
      cantidades = '';

      if (material){
        residuo.Material = material.Nombre;
        residuo.Aprovechable = material.Aprovechable;
      }
      if (tercero)
        residuo.Propietario = tercero.Nombre;
      if (punto)
        residuo.DepositoOrigen = punto.Nombre;
      if (residuo.IdDeposito) {
        const deposito = puntos.find(x => x.IdDeposito == residuo.IdDeposito);
        if (deposito)
          ubicacion = deposito.Nombre;
      }
      else if (residuo.IdVehiculo){
        ubicacion = residuo.IdVehiculo;
      }
      else if (residuo.IdRuta) {
        const actividad = actividades.find(x => x.IdServicio == SERVICE_TYPES.COLLECTION && x.IdRecurso == residuo.IdRuta);
        if (actividad)
          ubicacion = actividad.Titulo;
      }
      residuo.Ubicacion = ubicacion;
      if (residuo.Cantidad ?? 0 > 0){
        cantidades += `${residuo.Cantidad} ${Utils.quantityUnit}`;
      }
      if (residuo.Peso ?? 0 > 0){
        if (cantidades != '')
          cantidades += `/${residuo.Peso} ${Utils.weightUnit}`;
        else
          cantidades = `${residuo.Peso} ${Utils.weightUnit}`;
      }
      if (residuo.Volumen ?? 0 > 0){
        if (cantidades != '')
          cantidades += `/${residuo.Volumen} ${Utils.volumeUnit}`;
        else
          cantidades = `${residuo.Volumen} ${Utils.volumeUnit}`;
      }
      residuo.Cantidades = cantidades;
    });

    return residuos;
  }

  async getResiduo(idResiduo: string): Promise<Residuo | undefined> {
    const inventario: Residuo[] = await this.list();

    if (inventario)
    {
      const residuoInventario = inventario.find(x => x.IdResiduo == idResiduo);
      return residuoInventario;
    }

    return undefined;
  }

  async createResiduo(residuo: Residuo) {
    let inventario: Residuo[] = await this.storage.get('Inventario');

    if (!inventario)
      inventario = [];
    inventario.push(residuo);
    await this.storage.set('Inventario', inventario);
  }

  async updateResiduo(residuo: Residuo) {
    const residuos: Residuo[] = await this.storage.get('Inventario');
    const residuoStorage: Residuo = residuos.find((item) => item.IdResiduo == residuo.IdResiduo)!;
    if (residuoStorage) {
      residuoStorage.CRUD = CRUD_OPERATIONS.UPDATE;
      residuoStorage.IdEstado = residuo.IdEstado;
      residuoStorage.Cantidad = residuo.Cantidad;
      residuoStorage.CantidadEmbalaje = residuo.CantidadEmbalaje;
      residuoStorage.IdEmbalaje = residuo.IdEmbalaje;
      residuoStorage.Peso = residuo.Peso;
      residuoStorage.IdDeposito = residuo.IdDeposito;
    }
    await this.storage.set("Inventario", residuos);
  }
}

