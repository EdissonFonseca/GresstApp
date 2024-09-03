import { Injectable } from "@angular/core";
import { Residuo } from "../interfaces/residuo.interface";
import { Actividad } from "../interfaces/actividad.interface";
import { Cuenta } from "../interfaces/cuenta.interface";
import { StorageService } from "./storage.service";
import { CRUDOperacion, TipoServicio } from "./constants.service";
import { MaterialesService } from "./materiales.service";
import { TercerosService } from "./terceros.service";
import { PuntosService } from "./puntos.service";
import { Globales } from "./globales.service";

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  constructor(
    private storage: StorageService,
    private globales: Globales,
    private materialesService: MaterialesService,
    private tercerosService: TercerosService,
    private puntosService: PuntosService
  ) {}

  async list(): Promise<Residuo[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const residuos: Residuo[] = await this.storage.get('Inventario');
    const materiales = await this.materialesService.list();
    const terceros = await this.tercerosService.list();
    const puntos = await this.puntosService.list();
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
        const actividad = actividades.find(x => x.IdServicio == TipoServicio.Recoleccion && x.IdRecurso == residuo.IdRuta);
        if (actividad)
          ubicacion = actividad.Titulo;
      }
      residuo.Ubicacion = ubicacion;
      if (residuo.Cantidad ?? 0 > 0){
        cantidades += `${residuo.Cantidad} ${this.globales.unidadCantidad}`;
      }
      if (residuo.Peso ?? 0 > 0){
        if (cantidades != '')
          cantidades += `/${residuo.Peso} ${this.globales.unidadPeso}`;
        else
          cantidades = `${residuo.Peso} ${this.globales.unidadPeso}`;
      }
      if (residuo.Volumen ?? 0 > 0){
        if (cantidades != '')
          cantidades += `/${residuo.Volumen} ${this.globales.unidadVolumen}`;
        else
          cantidades = `${residuo.Volumen} ${this.globales.unidadVolumen}`;
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
      residuoStorage.CRUD = CRUDOperacion.Update;
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

