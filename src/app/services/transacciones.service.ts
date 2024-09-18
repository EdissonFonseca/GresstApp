import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { TareasService } from './tareas.service';
import { Cuenta } from '../interfaces/cuenta.interface';
import { Tarea } from '../interfaces/tarea.interface';
import { CRUDOperacion, EntradaSalida, Estado } from './constants.service';
import { Globales } from './globales.service';
import { PuntosService } from './puntos.service';
import { TercerosService } from './terceros.service';
import { SynchronizationService } from './synchronization.service';

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
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    const transacciones: Transaccion[] = actividad.Transacciones;
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
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    let transaccion: Transaccion | undefined;

    if (actividad){
      transaccion = actividad.Transacciones.find(x => x.IdTransaccion == idTransaccion)!;
      const tareas = actividad.Tareas.filter(x => x.IdTransaccion == idTransaccion);
      const resumen = this.globales.getResumen(tareas);
      transaccion.Cantidad = resumen.cantidad;
      transaccion.Peso = resumen.peso;
      transaccion.Volumen = resumen.volumen;
      transaccion.ItemsAprobados = resumen.aprobados;
      transaccion.ItemsPendientes = resumen.pendientes;
      transaccion.ItemsRechazados = resumen.rechazados;
      transaccion.Cantidades = resumen.resumen;
      transaccion.Titulo = `${transaccion.Tercero}-${transaccion.Punto ?? ''}`;
    }

    return transaccion;
  }

  async getByPunto(idActividad: string, idPunto: string) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    let transaccion: Transaccion | undefined;

    if (actividad) {
      transaccion = actividad.Transacciones.find(x => x.IdDeposito == idPunto)!;
    }
    return transaccion;
  }

  async getByTercero(idActividad: string, idTercero: string) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    let transaccion: Transaccion | undefined = undefined;

    if (actividad)
    {
      transaccion = actividad.Transacciones.find(x => x.IdTercero == idTercero)!;
    }
    return transaccion;
  }

  async create(idActividad: string, transaccion: Transaccion) {
    console.log(idActividad);
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad = actividades.find(x => x.IdActividad == idActividad);
    if (actividad) {
      actividad.Transacciones.push(transaccion);
      await this.storage.set('Actividades', actividades);
      await this.synchronizationService.uploadTransactions();
    }
  }

  async update(idActividad: string, transaccion: Transaccion) {
    const now = new Date();
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad)
    {
      const current = actividad.Transacciones.find((trx) => trx.IdTransaccion == transaccion.IdTransaccion);
      if (current) {
        current.CRUD = CRUDOperacion.Update;
        current.CRUDDate = now;
        current.IdEstado = transaccion.IdEstado;
        current.ResponsableCargo = transaccion.ResponsableCargo;
        current.ResponsableFirma = transaccion.ResponsableFirma;
        current.ResponsableIdentificacion = transaccion.ResponsableIdentificacion;
        current.ResponsableNombre = transaccion.ResponsableNombre;
        current.Observaciones = transaccion.Observaciones;

        const tareas = actividad.Tareas.filter(x => x.IdTransaccion == transaccion.IdTransaccion && x.IdEstado == Estado.Pendiente && x.CRUD == null);
        tareas.forEach(x => {
          x.IdEstado = Estado.Rechazado,
          x.CRUD = CRUDOperacion.Update,
          x.CRUDDate = now
        });

        await this.storage.set("Actividades", actividades);
        await this.synchronizationService.uploadTransactions();
      }
    }
  }
}
