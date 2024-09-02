import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Tarea } from '../interfaces/tarea.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Cuenta } from '../interfaces/cuenta.interface';
import { EntradaSalida, Estado, TipoMedicion, TipoServicio } from './constants.service';
import { Globales } from './globales.service';
import { InventarioService } from './inventario.service';
import { SynchronizationService } from './synchronization.service';
import { MaterialesService } from './materiales.service';
import { TratamientosService } from './tratamientos.service';
import { EmbalajesService } from './embalajes.service';
import { PuntosService } from './puntos.service';

@Injectable({
  providedIn: 'root',
})
export class TareasService {
  constructor(
    private storage: StorageService,
    private inventarioService: InventarioService,
    private synchronizationService: SynchronizationService,
    private materialesService: MaterialesService,
    private tratamientosService: TratamientosService,
    private embalajesService: EmbalajesService,
    private puntosService: PuntosService,
    private globales: Globales
  ) {}

  async get(idActividad: string, idTransaccion: string, idTarea: string): Promise<Tarea | undefined> {
    const tareas: Tarea[]= await this.list(idActividad);
    let tarea: Tarea | undefined = undefined;

    if (tareas)
        tarea = tareas.find((tarea) => tarea.IdTransaccion == idTransaccion && tarea.IdTarea == idTarea);
    return tarea;
  }

  async list(idActividad: string): Promise<Tarea[]>{
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    const materiales = await this.materialesService.list();
    const tratamientos = await this.tratamientosService.list();
    const tareas: Tarea[] = actividad.Tareas;

    tareas.forEach((tarea) => {
      const material = materiales.find((x) => x.IdMaterial == tarea.IdMaterial);

      if (material){
        tarea.Material = material.Nombre;
          if (tarea.IdTratamiento != null)
          {
            const tratamientoItem = tratamientos.find((x) => x.IdTratamiento == tarea.IdTratamiento);
            if (tratamientoItem)
              tarea.Tratamiento = tratamientoItem.Nombre;
          }
      }
      tarea.IdServicio = actividad.IdServicio;
    });

    return tareas;
  }

  async listSugeridas(idActividad: string, idTransaccion: string){
    let tareas: Tarea[] = [];
    let validarInventario: boolean;
    let crear: boolean;
    let embalaje: string;
    let accion: string;
    const now = new Date();
    const isoDate = now.toISOString();
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;

    const materiales = await this.materialesService.list();
    const tratamientos = await this.tratamientosService.list();
    const embalajes = await this.embalajesService.list();

    if (actividad)
    {
      if (idTransaccion)
        tareas = actividad.Tareas.filter(x => x.IdTransaccion == idTransaccion);
      else
        tareas = actividad.Tareas;

      if (tareas.length > 0){
        tareas.filter(x => x.EntradaSalida == EntradaSalida.Entrada || x.IdResiduo)?.forEach((tarea) => {
          tarea.IdServicio = actividad.IdServicio;
          const material = materiales.find((x) => x.IdMaterial == tarea.IdMaterial);
          let resumen: string = '';
          accion = '';
          validarInventario = false;
          crear = true;

          if (material){
            tarea.Material = material.Nombre;
            if (tarea.IdTratamiento != null)
            {
              const tratamientoItem = tratamientos.find((x) => x.IdTratamiento == tarea.IdTratamiento);
              if (tratamientoItem)
                tarea.Tratamiento = tratamientoItem.Nombre;
            }
            if (tarea.IdEmbalaje)
            {
              const embalajeData = embalajes.find((x) => x.IdEmbalaje == tarea.IdEmbalaje);
              if (embalajeData)
                embalaje = `- (${tarea.CantidadEmbalaje ?? ''} ${embalajeData.Nombre}`;
            }

            switch(actividad.IdServicio){
              case TipoServicio.Recoleccion:
              case TipoServicio.Transporte:
                if (tarea.EntradaSalida != 'E')
                  validarInventario = true;
                break;
              default:
                validarInventario = true;
                break;
            }
            resumen = this.globales.getResumen(material.TipoMedicion, material.TipoCaptura, tarea.Cantidad ?? 0, cuenta.UnidadCantidad, tarea.Peso?? 0, cuenta.UnidadPeso, tarea.Volumen ?? 0, cuenta.UnidadVolumen);
            switch(tarea.IdServicio){
              case TipoServicio.Almacenamiento:
                accion = 'Almacenar';
                break;
              case TipoServicio.Disposicion:
                accion = tarea.Tratamiento ?? 'Disponer';
                break;
              case TipoServicio.Recepcion:
                accion = 'Recibir';
                break;
                case TipoServicio.Generacion:
                  accion = 'Generar';
                  break;
              case TipoServicio.Recoleccion:
              case TipoServicio.Transporte:
                if (tarea.EntradaSalida == 'E'){
                  accion = 'Recoger';
                } else {
                  accion = 'Entregar';
                }
                break;
               case TipoServicio.Entrega:
                accion = 'Entregar';
                break;
               case TipoServicio.Tratamiento:
                accion = tarea.Tratamiento ?? 'Transformar';
                break;
            }
            tarea.Accion = accion;
            tarea.Cantidades = resumen;
            tarea.Embalaje = embalaje;
          }
        });
      }
      if ((actividad.IdServicio == TipoServicio.Recoleccion || actividad.IdServicio == TipoServicio.Transporte) && idTransaccion) { //las tareas corresponden a la configuracion si es una ruta
        const puntos = await this.puntosService.list();
        var transaccion = actividad.Transacciones.find(x => x.IdTransaccion == idTransaccion);
        if (transaccion && transaccion.IdDeposito)
        {
          var punto = await this.puntosService.get(transaccion.IdDeposito);
          if (punto){
            punto.IdMateriales?.forEach((idMaterial) => {
              const tareaMaterial = tareas.find(x => x.IdMaterial == idMaterial);
              if (!tareaMaterial) {
                const material = materiales.find((x) => x.IdMaterial == idMaterial);

                if (material){
                  const tarea: Tarea = {
                    IdTarea: this.globales.newId(),
                    IdMaterial: material.IdMaterial,
                    Accion: 'Recoger',
                    FechaSistema : isoDate,
                    IdRecurso: actividad.IdRecurso,
                    IdServicio: actividad.IdServicio,
                    IdTransaccion: idTransaccion,
                    IdEstado: Estado.Inactivo,
                    EntradaSalida: EntradaSalida.Salida,
                    Material: material.Nombre,
                    CRUDDate: new Date(),
                    Fotos: []
                  };
                  tareas.push(tarea);
                }
              }
            });
          }
        }
      }
      if (actividad.IdServicio === TipoServicio.Transporte) {
        var transaccion = actividad.Transacciones.find(x => x.IdTransaccion == idTransaccion);

        if (transaccion && transaccion.EntradaSalida != EntradaSalida.Entrada){
          const residuos = (await this.inventarioService.list()).filter(x => x.IdVehiculo == actividad.IdRecurso);
          residuos.forEach((residuo) => {
            const material = materiales.find((x) => x.IdMaterial == residuo.IdMaterial);
            let embalaje: string = '';
            let cantidades = '';

            if (material){
              if (residuo.IdEmbalaje)
              {
                const embalajeData = embalajes.find((x) => x.IdEmbalaje == residuo.IdEmbalaje);
                if (embalajeData)
                  embalaje = `- (${residuo.CantidadEmbalaje ?? ''} ${embalajeData.Nombre}`;
              }
              if (material.TipoMedicion == TipoMedicion.Cantidad)
                cantidades = `${residuo.Cantidad ?? 0} Un ${embalaje}`;
              else
                cantidades = `${residuo.Peso ?? 0} Kg ${embalaje}`;

              const tarea = tareas.find(x => x.IdMaterial == residuo.IdMaterial && x.EntradaSalida == EntradaSalida.Salida);
              if (tarea) {
                  tarea.IdResiduo = residuo.IdResiduo;
                  tarea.IdTransaccion = idTransaccion;
                  tarea.Material = material.Nombre;
                  tarea.Cantidades = cantidades;
                  tarea.Cantidad = residuo.Cantidad;
                  tarea.Peso = residuo.Peso;
                  tarea.Volumen = residuo.Volumen;
                  tarea.Accion = 'Entregar';
              } else {
                const tarea: Tarea = {
                  IdTarea: this.globales.newId(),
                  IdMaterial: material.IdMaterial,
                  IdResiduo: residuo.IdResiduo,
                  Accion: 'Entregar',
                  IdTransaccion: idTransaccion,
                  IdEstado: Estado.Inactivo,
                  FechaSistema: isoDate,
                  IdRecurso: actividad.IdRecurso,
                  IdServicio: actividad.IdServicio,
                  EntradaSalida: EntradaSalida.Salida,
                  Cantidades: cantidades,
                  Cantidad: residuo.Cantidad,
                  Peso: residuo.Peso,
                  Volumen: residuo.Volumen,
                  Material: material.Nombre,
                  CRUDDate: new Date(),
                  Fotos: []
                };
                tareas.push(tarea);
              }
            }
          });
        }
      }
    }
    return tareas;
  }

  async create(idActividad: string, tarea: Tarea) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad = actividades.find(x => x.IdActividad == idActividad);
    if (actividad){
      actividad.Tareas.push(tarea);
      await this.storage.set('Actividades', actividades);
      await this.synchronizationService.uploadTransactions();
    }
  }

  async update(idActividad: string, idTransaccion: string, tarea: Tarea) {
    let tareaUpdate: Tarea | undefined = undefined;
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad)
    {
      if (tarea.Item == null)
        tareaUpdate = actividad.Tareas.find((t) => t.IdTransaccion == idTransaccion && t.IdMaterial == tarea.IdMaterial);
      else
        tareaUpdate = actividad.Tareas.find((t) => t.IdTransaccion == idTransaccion && t.Item == tarea.Item);
      if (tareaUpdate)
      {
        tareaUpdate.Cantidad = tarea.Cantidad;
        tareaUpdate.CantidadEmbalaje = tarea.CantidadEmbalaje;
        tareaUpdate.IdEmbalaje = tarea.IdEmbalaje;
        tareaUpdate.IdTratamiento = tarea.IdTratamiento;
        tareaUpdate.Peso = tarea.Peso;
        tareaUpdate.Valor = tarea.Valor;
        tareaUpdate.Observaciones = tarea.Observaciones;
        tareaUpdate.IdEstado = tarea.IdEstado;
        tareaUpdate.Fotos = tarea.Fotos;
        await this.storage.set("Actividades", actividades);
        await this.synchronizationService.uploadTransactions();
      }
    }
  }
}
