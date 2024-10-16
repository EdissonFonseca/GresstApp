import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { TareasService } from './tareas.service';
import { Tarea } from '../interfaces/tarea.interface';
import { CRUDOperacion, EntradaSalida, Estado } from './constants.service';
import { Globales } from './globales.service';
import { PuntosService } from './puntos.service';
import { TercerosService } from './terceros.service';
import { SynchronizationService } from './synchronization.service';
import { Transaction } from '../interfaces/transaction.interface';

@Injectable({
  providedIn: 'root',
})
export class TransaccionesService {
  constructor(
    private storage: StorageService,
    private tareasService: TareasService,
    private puntosService: PuntosService,
    private tercerosService: TercerosService,
    private synchronizationService: SynchronizationService,
    private globales: Globales
  ) {}

  async list(idActividad: string){
    let nombre: string = '';
    let operacion: string = '';
    let ubicacion: string = '';
    const transaction: Transaction = await this.storage.get('Transaction');
    const transacciones: Transaccion[] = transaction.Transacciones.filter((x) => x.IdActividad == idActividad);
    const puntos = await this.puntosService.list();
    const terceros = await this.tercerosService.list();
    const tareas: Tarea[] = await this.tareasService.list(idActividad);

    transacciones.forEach(transaccion => {
      operacion = transaccion.EntradaSalida;
      if (tareas)
      {
        const tareas2 = tareas.filter((x) => x.IdTransaccion === transaccion.IdTransaccion);
        if (transaccion.IdDeposito != null)
        {
          transaccion.Icono = 'location-outline';
          const punto = puntos.find(x => x.IdDeposito == transaccion.IdDeposito);
          if (punto) {
            transaccion.Punto = punto.Nombre;
            const tercero = terceros.find(x => x.IdPersona == punto.IdPersona);
            if (tercero)
              transaccion.Tercero = `${tercero.Nombre} - ${nombre}`;
            ubicacion = '';
            if (punto.Localizacion)
            {
              if (punto.Direccion)
                ubicacion = `${punto.Localizacion}-${punto.Direccion}`;
              else
                ubicacion = `${punto.Localizacion}`;
            } else if (punto.Direccion){
              ubicacion = `${punto.Direccion}`;
            }
            transaccion.Ubicacion = ubicacion;
            if (transaccion.EntradaSalida == EntradaSalida.Transferencia)
              operacion = EntradaSalida.Transferencia;
            else if (transaccion.EntradaSalida == EntradaSalida.Entrada)
              operacion = EntradaSalida.Entrada;
            else if (transaccion.EntradaSalida == EntradaSalida.Salida)
              operacion = EntradaSalida.Salida;
        }
      } else if (transaccion && transaccion.IdTercero != null) {
        const tercero = terceros.find(x => x.IdPersona == transaccion.IdTercero);
        if (tercero) {
          transaccion.Tercero = tercero.Nombre;
          transaccion.Icono = 'person';
        }
      }
      const resumen = this.globales.getResumen(tareas2);
      transaccion.Accion = this.globales.getAccionEntradaSalida(operacion ?? '');
      transaccion.Cantidad = resumen.cantidad;
      transaccion.Peso = resumen.peso;
      transaccion.Volumen = resumen.volumen;
      transaccion.ItemsAprobados = resumen.aprobados;
      transaccion.ItemsPendientes = resumen.pendientes;
      transaccion.ItemsRechazados = resumen.rechazados;
      transaccion.Cantidades = resumen.resumen;
      transaccion.Titulo = `${transaccion.Solicitudes}-${transaccion.Tercero}-${transaccion.Punto ?? ''}`;
      }
    });
    return transacciones;
  }

  async get(idActividad: string, idTransaccion: string) {
    const transaction: Transaction = await this.storage.get('Transaction');
    let transaccion: Transaccion | undefined;

    if (transaction){
      transaccion = transaction.Transacciones.find(x => x.IdActividad == idActividad && x.IdTransaccion == idTransaccion)!;
      const tareas = transaction.Tareas.filter(x => x.IdActividad == idActividad && x.IdTransaccion == idTransaccion);
      const resumen = this.globales.getResumen(tareas);
      transaccion.Cantidad = resumen.cantidad;
      transaccion.Peso = resumen.peso;
      transaccion.Volumen = resumen.volumen;
      transaccion.ItemsAprobados = resumen.aprobados;
      transaccion.ItemsPendientes = resumen.pendientes;
      transaccion.ItemsRechazados = resumen.rechazados;
      transaccion.Cantidades = resumen.resumen;
      if (transaccion.Titulo == '' || transaccion.Titulo == undefined)
        transaccion.Titulo = `${transaccion.Tercero}-${transaccion.Punto ?? ''}`;
    }

    return transaccion;
  }

  async getByPunto(idActividad: string, idPunto: string) {
    const transaction: Transaction = await this.storage.get('Transaction');
    let transaccion: Transaccion | undefined;

    if (transaction) {
      transaccion = transaction.Transacciones.find(x => x.IdActividad == idActividad && x.IdDeposito == idPunto)!;
    }
    return transaccion;
  }

  async getByTercero(idActividad: string, idTercero: string) {
    const transaction: Transaction = await this.storage.get('Transaction');
    let transaccion: Transaccion | undefined = undefined;

    if (transaction)
    {
      transaccion = transaction.Transacciones.find(x => x.IdActividad == idActividad && x.IdTercero == idTercero)!;
    }
    return transaccion;
  }

  async create(transaccion: Transaccion) {
    const now = new Date().toISOString();
    const [latitud, longitud] = await this.globales.getCurrentPosition();
    const transaction: Transaction = await this.storage.get('Transaction');

    if (transaction) {
      transaccion.FechaInicial = now;
      transaccion.CRUD = CRUDOperacion.Create;
      transaccion.Longitud = longitud;
      transaccion.Latitud = latitud;
      transaction.Transacciones.push(transaccion);
      await this.storage.set('Transaction', transaction);
      await this.synchronizationService.uploadTransactions();
    }
  }

  async update(transaccion: Transaccion) {
    const now = new Date().toISOString();
    const [latitud, longitud] = await this.globales.getCurrentPosition();
    const transaction: Transaction = await this.storage.get('Transaction');

    if (transaction)
    {
      const current = transaction.Transacciones.find((trx) => trx.IdActividad == transaccion.IdActividad && trx.IdTransaccion == transaccion.IdTransaccion);
      if (current) {
        current.CRUD = CRUDOperacion.Update;
        current.IdEstado = transaccion.IdEstado;
        if (current.FechaInicial == null) current.FechaInicial = now;
        current.FechaFinal = now;
        current.ResponsableCargo = transaccion.ResponsableCargo;
        current.ResponsableFirma = transaccion.ResponsableFirma;
        current.ResponsableIdentificacion = transaccion.ResponsableIdentificacion;
        current.ResponsableNombre = transaccion.ResponsableNombre;
        current.ResponsableObservaciones = transaccion.ResponsableObservaciones;
        current.CantidadCombustible = transaccion.CantidadCombustible;
        current.CostoCombustible = transaccion.CostoCombustible;
        current.Kilometraje = transaccion.Kilometraje;
        current.Latitud = latitud;
        current.Longitud = longitud;

        const tareas = transaction.Tareas.filter(x => x.IdActividad == transaccion.IdActividad && x.IdTransaccion == transaccion.IdTransaccion && x.IdEstado == Estado.Pendiente && x.CRUD == null);
        tareas.forEach(x => {
          x.IdEstado = Estado.Rechazado,
          x.FechaEjecucion = now,
          x.CRUD = CRUDOperacion.Update
        });

        await this.storage.set("Transaction", transaction);
        await this.synchronizationService.uploadTransactions();
      }
    }
  }
}
