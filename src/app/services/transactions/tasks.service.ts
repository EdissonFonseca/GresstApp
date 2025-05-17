import { Injectable } from '@angular/core';
import { StorageService } from '../core/storage.service';
import { Tarea } from '../../interfaces/tarea.interface';
import { Actividad } from '../../interfaces/actividad.interface';
import { CRUD_OPERATIONS, INPUT_OUTPUT, STATUS, SERVICE_TYPES, STORAGE } from '@app/constants/constants';
import { Transaction } from '@app/interfaces/transaction.interface';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { TreatmentsService } from '@app/services/masterdata/treatments.service';
import { PackagingService } from '@app/services/masterdata/packaging.service';
import { PointsService } from '@app/services/masterdata/points.service';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { Utils } from '@app/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(
    private storage: StorageService,
    private inventoryService: InventoryService,
    private materialsService: MaterialsService,
    private treatmentsService: TreatmentsService,
    private packagingService: PackagingService,
    private pointsService: PointsService,
    private thirdpartiesService: ThirdpartiesService
  ) {}

  async get(idActividad: string, idTransaccion: string, idTarea: string): Promise<Tarea | undefined> {
    const tareas: Tarea[]= await this.list(idActividad);
    let tarea: Tarea | undefined = undefined;

    if (tareas)
        tarea = tareas.find((tarea) => tarea.IdTransaccion == idTransaccion && tarea.IdTarea == idTarea);
    return tarea;
  }

  async list(idActividad: string, idTransaccion?: string | null): Promise<Tarea[]>{
    const transaction: Transaction = await this.storage.get(STORAGE.TRANSACTION);
    const materials = await this.materialsService.list();
    const treatments = await this.treatmentsService.list();
    const actividad: Actividad | undefined = transaction.Actividades.find((x) => x.IdActividad == idActividad);
    let tareas: Tarea[] = transaction.Tareas.filter((tarea) => tarea.IdActividad == idActividad);

    if (idTransaccion)
      tareas = tareas.filter((tarea) => tarea.IdTransaccion == idTransaccion);

    tareas.forEach((tarea) => {
      const material = materials.find((x) => x.IdMaterial == tarea.IdMaterial);

      if (material){
        tarea.Material = material.Nombre;
          if (tarea.IdTratamiento != null)
          {
            const tratamientoItem = treatments.find((x) => x.IdTratamiento == tarea.IdTratamiento);
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
    const transaction: Transaction = await this.storage.get(STORAGE.TRANSACTION);
    const actividad: Actividad | undefined = transaction.Actividades.find((item) => item.IdActividad == idActividad);

    if (!actividad) {
      console.error('No se encontró la actividad con ID:', idActividad);
      return [];
    }

    const materials = await this.materialsService.list();
    const treatments = await this.treatmentsService.list();
    const embalajes = await this.packagingService.list();
    const puntos = await this.pointsService.list();
    const terceros = await this.thirdpartiesService.list();

    if (transaction) {
      if (idTransaccion)
        tareas = transaction.Tareas.filter(x => x.IdActividad == idActividad && x.IdTransaccion == idTransaccion);
      else
        tareas = transaction.Tareas.filter(x => x.IdActividad == idActividad);

      if (tareas.length > 0){
        tareas.filter(x => x.EntradaSalida == INPUT_OUTPUT.INPUT || x.IdResiduo)?.forEach(async (tarea) => {
          tarea.IdServicio = actividad.IdServicio;
          const material = materials.find((x) => x.IdMaterial == tarea.IdMaterial);
          let resumen: string = '';
          accion = 'Ver';

          if (material){
            tarea.Material = material.Nombre;
            if (tarea.IdTratamiento != null) {
              const tratamientoItem = treatments.find((x) => x.IdTratamiento == tarea.IdTratamiento);
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

            if (tarea.IdEstado == STATUS.PENDING){
              switch(tarea.IdServicio) {
                case SERVICE_TYPES.STORAGE:
                  accion = 'Almacenar';
                  break;
                case SERVICE_TYPES.DISPOSAL:
                  accion = tarea.Tratamiento ?? 'Disponer';
                  break;
                case SERVICE_TYPES.RECEPTION:
                  accion = 'Recibir';
                  break;
                case SERVICE_TYPES.GENERATION:
                    accion = 'Generar';
                    break;
                case SERVICE_TYPES.COLLECTION:
                case SERVICE_TYPES.TRANSPORT:
                  if (tarea.EntradaSalida == 'E'){
                    accion = 'Recoger';
                  } else {
                    accion = 'Entregar';
                  }
                  break;
                case SERVICE_TYPES.DELIVERY:
                  accion = 'Entregar';
                  break;
                case SERVICE_TYPES.TREATMENT:
                  accion = tarea.Tratamiento ?? 'Transformar';
                  break;
              }
            }
            tarea.Accion = accion;
            tarea.Embalaje = embalaje;
          }
        });
      }
      if ((actividad.IdServicio == SERVICE_TYPES.COLLECTION || actividad.IdServicio == SERVICE_TYPES.TRANSPORT) && idTransaccion) { //las tareas corresponden a la configuracion si es una ruta
        const puntos = await this.pointsService.list();
        var transaccion = transaction.Transacciones.find(x => x.IdActividad == idActividad && x.IdTransaccion == idTransaccion);
        if (transaccion && transaccion.IdDeposito)
        {
          var punto = await this.pointsService.get(transaccion.IdDeposito);
          if (punto){
            punto.IdMateriales?.forEach((idMaterial: string) => {
              const tareaMaterial = tareas.find(x => x.IdMaterial == idMaterial);
              if (!tareaMaterial) {
                const material = materials.find((x) => x.IdMaterial == idMaterial);

                if (material){
                  const tarea: Tarea = {
                    IdActividad: idActividad,
                    IdTransaccion: idTransaccion,
                    IdTarea: Utils.generateId(),

                    IdMaterial: material.IdMaterial,
                    Accion: 'Recoger',
                    FechaEjecucion : now,
                    IdRecurso: actividad.IdRecurso,
                    IdServicio: actividad.IdServicio,
                    IdEstado: STATUS.INACTIVE,
                    EntradaSalida: INPUT_OUTPUT.OUTPUT,
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
      if (actividad.IdServicio === SERVICE_TYPES.TRANSPORT) {
        var transaccion = transaction.Transacciones.find(x => x.IdActividad == idActividad && x.IdTransaccion == idTransaccion);

        if (transaccion && transaccion.EntradaSalida != INPUT_OUTPUT.INPUT){
            const residuos = (await this.inventoryService.list()).filter(x => x.IdVehiculo == actividad.IdRecurso);
          residuos.forEach((residuo) => {
            const material = materials.find((x) => x.IdMaterial == residuo.IdMaterial);
            let embalaje: string = '';

            if (material){
              if (residuo.IdEmbalaje)
              {
                const embalajeData = embalajes.find((x) => x.IdEmbalaje == residuo.IdEmbalaje);
                if (embalajeData)
                  embalaje = `- (${residuo.CantidadEmbalaje ?? ''} ${embalajeData.Nombre}`;
              }

              const tarea = tareas.find(x => x.IdMaterial == residuo.IdMaterial && x.EntradaSalida == INPUT_OUTPUT.OUTPUT);
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
                  IdTarea: Utils.generateId(),

                  IdMaterial: material.IdMaterial,
                  IdResiduo: residuo.IdResiduo,
                  Accion: 'Entregar',
                  IdEstado: STATUS.INACTIVE,
                  FechaEjecucion: now,
                  IdRecurso: actividad.IdRecurso,
                  IdServicio: actividad.IdServicio,
                  EntradaSalida: INPUT_OUTPUT.OUTPUT,
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
    const transaction: Transaction = await this.storage.get(STORAGE.TRANSACTION);

    if (transaction){
      tarea.CRUD = CRUD_OPERATIONS.CREATE;
      transaction.Tareas.push(tarea);
      await this.storage.set(STORAGE.TRANSACTION, transaction);
    }
  }

  async update(idActividad: string, idTransaccion: string, tarea: Tarea) {
    const now = new Date().toISOString();
    let tareaUpdate: Tarea | undefined = undefined;
    const transaction: Transaction = await this.storage.get(STORAGE.TRANSACTION);

    if (transaction)
    {
      if (tarea.Item == null)
        tareaUpdate = transaction.Tareas.find((t) => t.IdActividad == idActividad && t.IdTransaccion == idTransaccion && t.IdMaterial == tarea.IdMaterial);
      else
        tareaUpdate = transaction.Tareas.find((t) => t.IdActividad == idActividad && t.IdTransaccion == idTransaccion && t.Item == tarea.Item);
      if (tareaUpdate)
      {
        tareaUpdate.CRUD = CRUD_OPERATIONS.UPDATE;
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
        await this.storage.set(STORAGE.TRANSACTION, transaction);
      }
    }
  }
}
