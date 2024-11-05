import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Transaccion } from '../interfaces/transaccion.interface';
import { TareasService } from './tareas.service';
import { Tarea } from '../interfaces/tarea.interface';
import { CRUDOperacion, EntradaSalida, Estado } from './constants.service';
import { GlobalesService } from './globales.service';
import { PuntosService } from './puntos.service';
import { TercerosService } from './terceros.service';
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
    private globales: GlobalesService
  ) {}

  async getSummary(idActividad: string, idTransaccion: string): Promise<{ aprobados: number; pendientes: number; rechazados: number; cantidad: number; peso: number; volumen:number }> {
    const tareas = await this.tareasService.list(idActividad, idTransaccion);

    const resultado = tareas.reduce(
      (acumulador, tarea) => {
        if (tarea.IdEstado === Estado.Aprobado) {
          acumulador.aprobados += 1;
          acumulador.cantidad += tarea.Cantidad ?? 0;
          acumulador.peso += tarea.Peso ?? 0;
          acumulador.volumen += tarea.Volumen ?? 0;
        } else if (tarea.IdEstado === Estado.Pendiente) {
          acumulador.pendientes += 1;
        } else if (tarea.IdEstado === Estado.Rechazado) {
          acumulador.rechazados += 1;
        }
        return acumulador;
      },
      { aprobados: 0, pendientes: 0, rechazados: 0, cantidad: 0, peso: 0, volumen: 0 }
    );

    return resultado;
  }

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
      transaccion.Accion = this.globales.getAccionEntradaSalida(operacion ?? '');
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
    const transaction: Transaction = await this.storage.get('Transaction');

    if (transaction) {
      transaccion.FechaInicial = now;
      transaccion.CRUD = CRUDOperacion.Create;
      transaction.Transacciones.push(transaccion);
      await this.storage.set('Transaction', transaction);
    }
  }

  async update(transaccion: Transaccion) {
    const now = new Date().toISOString();
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

        const tareas = transaction.Tareas.filter(x => x.IdActividad == transaccion.IdActividad && x.IdTransaccion == transaccion.IdTransaccion && x.IdEstado == Estado.Pendiente && x.CRUD == null);
        tareas.forEach(x => {
          x.IdEstado = Estado.Rechazado,
          x.FechaEjecucion = now,
          x.CRUD = CRUDOperacion.Update
        });

        await this.storage.set("Transaction", transaction);
      }
    }
  }
}
