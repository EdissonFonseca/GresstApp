import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Tarea } from '../interfaces/tarea.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { CRUDOperacion, EntradaSalida, Estado, TipoMedicion, TipoServicio } from './constants.service';
import { GlobalesService } from './globales.service';
import { InventarioService } from './inventario.service';
import { MaterialesService } from './materiales.service';
import { TratamientosService } from './tratamientos.service';
import { EmbalajesService } from './embalajes.service';
import { PuntosService } from './puntos.service';
import { Transaction } from '../interfaces/transaction.interface';
import { TercerosService } from './terceros.service';

@Injectable({
  providedIn: 'root',
})
export class TareasService {
  constructor(
    private storage: StorageService,
    private inventarioService: InventarioService,
    private materialesService: MaterialesService,
    private tratamientosService: TratamientosService,
    private embalajesService: EmbalajesService,
    private puntosService: PuntosService,
    private tercerosService: TercerosService,
    private globales: GlobalesService
  ) {}

  async get(idActividad: string, idTransaccion: string, idTarea: string): Promise<Tarea | undefined> {
    const tareas: Tarea[]= await this.list(idActividad);
    let tarea: Tarea | undefined = undefined;

    if (tareas)
        tarea = tareas.find((tarea) => tarea.IdTransaccion == idTransaccion && tarea.IdTarea == idTarea);
    return tarea;
  }

  async list(idActividad: string, idTransaccion?: string | null): Promise<Tarea[]>{
    const transaction: Transaction = await this.storage.get('Transaction');
    const materiales = await this.materialesService.list();
    const tratamientos = await this.tratamientosService.list();
    const actividad: Actividad | undefined = transaction.Actividades.find((x) => x.IdActividad == idActividad);
    let tareas: Tarea[] = transaction.Tareas.filter((tarea) => tarea.IdActividad == idActividad);

    if (idTransaccion)
      tareas = tareas.filter((tarea) => tarea.IdTransaccion == idTransaccion);

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
      tarea.IdServicio = actividad?.IdServicio ?? '';
    });

    return tareas;
  }

  async listSugeridas(idActividad: string, idTransaccion?: string | null){
    let tareas: Tarea[] = [];
    let embalaje: string;
    let accion: string;
    const now = new Date().toISOString();
    const transaction: Transaction = await this.storage.get('Transaction');
    const actividad: Actividad | undefined = transaction.Actividades.find((item) => item.IdActividad == idActividad);

    if (!actividad) {
      console.error('No se encontró la actividad con ID:', idActividad);
      return [];
    }

    const materiales = await this.materialesService.list();
    const tratamientos = await this.tratamientosService.list();
    const embalajes = await this.embalajesService.list();
    const puntos = await this.puntosService.list();
    const terceros = await this.tercerosService.list();

    if (transaction) {
      if (idTransaccion)
        tareas = transaction.Tareas.filter(x => x.IdActividad == idActividad && x.IdTransaccion == idTransaccion);
      else
        tareas = transaction.Tareas.filter(x => x.IdActividad == idActividad);

      if (tareas.length > 0){
        tareas.filter(x => x.EntradaSalida == EntradaSalida.Entrada || x.IdResiduo)?.forEach(async (tarea) => {
          tarea.IdServicio = actividad.IdServicio;
          const material = materiales.find((x) => x.IdMaterial == tarea.IdMaterial);
          let resumen: string = '';
          accion = 'Ver';

          if (material){
            tarea.Material = material.Nombre;
            if (tarea.IdTratamiento != null) {
              const tratamientoItem = tratamientos.find((x) => x.IdTratamiento == tarea.IdTratamiento);
              if (tratamientoItem)
                tarea.Tratamiento = tratamientoItem.Nombre;
            }
            if (tarea.IdEmbalaje) {
              const embalajeData = embalajes.find((x) => x.IdEmbalaje == tarea.IdEmbalaje);
              if (embalajeData)
                embalaje = `- (${tarea.Cantidad ?? ''} ${embalajeData.Nombre}`;
            }
            if (tarea.IdDepositoDestino) {
              const deposito = puntos.find((x) => x.IdDeposito == tarea.IdDepositoDestino);
              if (deposito) {
                if (deposito.IdPersona != null){
                  const tercero = terceros.find((x) => x.IdPersona == deposito.IdPersona);
                  tarea.DepositoDestino = `${tercero?.Nombre} - ${deposito.Nombre}`;
                  } else {
                  tarea.DepositoDestino = `${deposito.Nombre}`;
                }
              }
            }

            if (tarea.IdEstado == Estado.Pendiente){
              switch(tarea.IdServicio) {
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
            }
            tarea.Accion = accion;
            tarea.Embalaje = embalaje;
          }
        });
      }
      if ((actividad.IdServicio == TipoServicio.Recoleccion || actividad.IdServicio == TipoServicio.Transporte) && idTransaccion) { //las tareas corresponden a la configuracion si es una ruta
        const puntos = await this.puntosService.list();
        var transaccion = transaction.Transacciones.find(x => x.IdActividad == idActividad && x.IdTransaccion == idTransaccion);
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
                    IdActividad: idActividad,
                    IdTransaccion: idTransaccion,
                    IdTarea: this.globales.newId(),

                    IdMaterial: material.IdMaterial,
                    Accion: 'Recoger',
                    FechaEjecucion : now,
                    IdRecurso: actividad.IdRecurso,
                    IdServicio: actividad.IdServicio,
                    IdEstado: Estado.Inactivo,
                    EntradaSalida: EntradaSalida.Salida,
                    Material: material.Nombre,
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
        var transaccion = transaction.Transacciones.find(x => x.IdActividad == idActividad && x.IdTransaccion == idTransaccion);

        if (transaccion && transaccion.EntradaSalida != EntradaSalida.Entrada){
          const residuos = (await this.inventarioService.list()).filter(x => x.IdVehiculo == actividad.IdRecurso);
          residuos.forEach((residuo) => {
            const material = materiales.find((x) => x.IdMaterial == residuo.IdMaterial);
            let embalaje: string = '';

            if (material){
              if (residuo.IdEmbalaje)
              {
                const embalajeData = embalajes.find((x) => x.IdEmbalaje == residuo.IdEmbalaje);
                if (embalajeData)
                  embalaje = `- (${residuo.CantidadEmbalaje ?? ''} ${embalajeData.Nombre}`;
              }

              const tarea = tareas.find(x => x.IdMaterial == residuo.IdMaterial && x.EntradaSalida == EntradaSalida.Salida);
              if (tarea) {
                  tarea.IdResiduo = residuo.IdResiduo;
                  tarea.IdTransaccion = idTransaccion ?? undefined;
                  tarea.Material = material.Nombre;
                  tarea.Cantidad = residuo.Cantidad;
                  tarea.Peso = residuo.Peso;
                  tarea.Volumen = residuo.Volumen;
                  tarea.Accion = 'Entregar';
              } else {
                const tarea: Tarea = {
                  IdActividad: idActividad,
                  IdTransaccion: idTransaccion ?? undefined,
                  IdTarea: this.globales.newId(),

                  IdMaterial: material.IdMaterial,
                  IdResiduo: residuo.IdResiduo,
                  Accion: 'Entregar',
                  IdEstado: Estado.Inactivo,
                  FechaEjecucion: now,
                  IdRecurso: actividad.IdRecurso,
                  IdServicio: actividad.IdServicio,
                  EntradaSalida: EntradaSalida.Salida,
                  Cantidad: residuo.Cantidad,
                  Peso: residuo.Peso,
                  Volumen: residuo.Volumen,
                  Material: material.Nombre,
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

  async create(tarea: Tarea) {
    const transaction: Transaction = await this.storage.get('Transaction');

    if (transaction){
      tarea.CRUD = CRUDOperacion.Create;
      transaction.Tareas.push(tarea);
      await this.storage.set('Transaction', transaction);
    }
  }

  async update(idActividad: string, idTransaccion: string, tarea: Tarea) {
    const now = new Date().toISOString();
    let tareaUpdate: Tarea | undefined = undefined;
    const transaction: Transaction = await this.storage.get('Transaction');

    if (transaction)
    {
      if (tarea.Item == null)
        tareaUpdate = transaction.Tareas.find((t) => t.IdActividad == idActividad && t.IdTransaccion == idTransaccion && t.IdMaterial == tarea.IdMaterial);
      else
        tareaUpdate = transaction.Tareas.find((t) => t.IdActividad == idActividad && t.IdTransaccion == idTransaccion && t.Item == tarea.Item);
      if (tareaUpdate)
      {
        tareaUpdate.CRUD = CRUDOperacion.Update;
        tareaUpdate.Cantidad = tarea.Cantidad;
        tareaUpdate.IdEmbalaje = tarea.IdEmbalaje;
        tareaUpdate.IdTratamiento = tarea.IdTratamiento;
        tareaUpdate.Peso = tarea.Peso;
        tareaUpdate.Volumen = tarea.Volumen;
        tareaUpdate.Valor = tarea.Valor;
        tareaUpdate.Observaciones = tarea.Observaciones;
        tareaUpdate.IdEstado = tarea.IdEstado;
        tareaUpdate.Fotos = tarea.Fotos;
        tareaUpdate.FechaEjecucion = now;
        await this.storage.set("Transaction", transaction);
      }
    }
  }
}
