import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { IntegrationService } from './integration.service';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { TareasService } from './tareas.service';
import { Cuenta } from '../interfaces/cuenta.interface';
import { Tarea } from '../interfaces/tarea.interface';
import { EntradaSalida, Estado } from './constants.service';
import { Globales } from './globales.service';

@Injectable({
  providedIn: 'root',
})
export class TransaccionesService {
  constructor(
    private storage: StorageService,
    private integration: IntegrationService,
    private tareasService: TareasService,
    private globales: Globales
  ) {}

  async list(idActividad: string){
    let nombre: string = '';
    let operacion: string = '';
    let ubicacion: string = '';
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    const transacciones: Transaccion[] = actividad.Transacciones;
    const puntos = await this.globales.getPuntos();
    const terceros = await this.globales.getTerceros();
    const tareas: Tarea[] = await this.tareasService.list(idActividad);
    let cantidad: number;
    let peso: number;
    let volumen: number;
    let aprobados: number;
    let pendientes: number;
    let rechazados: number;
    let resumen: string;

    transacciones.forEach(transaccion => {
      aprobados = pendientes = rechazados = peso = cantidad = volumen = 0;
      operacion = transaccion.EntradaSalida;
      resumen = '';
      if (tareas)
      {
        const tareas2 = tareas.filter((x) => x.IdTransaccion == transaccion.IdTransaccion);
        aprobados = tareas2.reduce((contador, tarea) => {
          if (tarea.IdEstado == Estado.Aprobado)
            return contador + 1;
          else
            return contador;
        }, 0);
        pendientes = tareas2.reduce((contador, tarea) => {
          if (tarea.IdEstado == Estado.Pendiente)
            return contador + 1;
          else
            return contador;
        }, 0);
        rechazados = tareas2.reduce((contador, tarea) => {
          if (tarea.IdEstado == Estado.Rechazado)
            return contador + 1;
          else
            return contador;
        }, 0);
        cantidad = tareas2.reduce((cantidad, tarea) => {
          if (tarea.IdEstado == Estado.Aprobado)
            return cantidad + (tarea.Cantidad ?? 0);
          else
            return cantidad;
        }, 0);
        peso = tareas2.reduce((peso, tarea) => {
          if (tarea.IdEstado == Estado.Aprobado)
            return peso + (tarea.Peso ?? 0);
          else
            return peso;
        }, 0);
        volumen = tareas2.reduce((volumen, tarea) => {
          if (tarea.IdEstado == Estado.Aprobado)
            return volumen + (tarea.Volumen ?? 0);
          else
            return volumen;
        }, 0);
        if (transaccion.IdPunto != null)
        {
          transaccion.Icono = 'location';
          const punto = puntos.find(x => x.IdPunto == transaccion.IdPunto);
          if (punto) {
            transaccion.Punto = punto.Nombre;
            const tercero = terceros.find(x => x.IdTercero == punto.IdTercero);
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

            if (cantidad > 0){
              resumen += `${cantidad} ${cuenta.UnidadCantidad}`;
            }
            if (peso > 0){
              if (resumen != '')
                resumen += `/${peso} ${cuenta.UnidadPeso}`;
              else
                resumen = `${peso} ${cuenta.UnidadPeso}`;
            }
            if (volumen > 0){
              if (resumen != '')
                resumen += `/${volumen} ${cuenta.UnidadVolumen}`;
              else
                resumen = `${volumen} ${cuenta.UnidadVolumen}`;
            }
        }
      } else if (transaccion && transaccion.IdTercero != null) {
        const tercero = terceros.find(x => x.IdTercero == transaccion.IdTercero);
        if (tercero) {
          transaccion.Tercero = tercero.Nombre;
          transaccion.Icono = 'person';
          if (cantidad > 0){
            resumen += `${cantidad} ${cuenta.UnidadCantidad}`;
          }
          if (peso > 0){
            if (resumen != '')
              resumen += `/${peso} ${cuenta.UnidadPeso}`;
            else
              resumen = `${peso} ${cuenta.UnidadPeso}`;
          }
          if (volumen > 0){
            if (resumen != '')
              resumen += `/${volumen} ${cuenta.UnidadVolumen}`;
            else
              resumen = `${volumen} ${cuenta.UnidadVolumen}`;
          }
        }
      }
      transaccion.Accion = this.globales.getAccionEntradaSalida(operacion ?? '');
      transaccion.Cantidad = cantidad;
      transaccion.Peso = peso;
      transaccion.Volumen = volumen;
      transaccion.ItemsAprobados = aprobados;
      transaccion.ItemsPendientes = pendientes;
      transaccion.ItemsRechazados = rechazados;
      transaccion.Cantidades = resumen;
      transaccion.Titulo = `${transaccion.Tercero}-${transaccion.Punto ?? ''}`;
      }
    });
    return transacciones;
  }

  async get(idActividad: string, idTransaccion: string) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    let transaccion: Transaccion | undefined;

    if (actividad)
      transaccion = actividad.Transacciones.find(x => x.IdTransaccion == idTransaccion)!;

    return transaccion;
  }

  async getByPunto(idActividad: string, idPunto: string) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    let transaccion: Transaccion | undefined;

    if (actividad) {
      transaccion = actividad.Transacciones.find(x => x.IdPunto == idPunto)!;
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
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad = actividades.find(x => x.IdActividad == idActividad);
    if (actividad) {
      actividad.Transacciones.push(transaccion);
      await this.storage.set('Actividades', actividades);
    }
  }

  async update(idActividad: string, transaccion: Transaccion) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad)
    {
      const current: Transaccion | undefined = actividad.Transacciones.find((trx) => trx.IdTransaccion == transaccion.IdTransaccion);
      if (current) {
        current.IdEstado = transaccion.IdEstado;
        current.IdentificacionResponsable = transaccion.IdentificacionResponsable;
        current.NombreResponsable = transaccion.NombreResponsable;
        current.Observaciones = transaccion.Observaciones;
        current.Firma = transaccion.Firma;
        current.FirmaUrl = transaccion.FirmaUrl;

        const tareasSincronizar = actividad.Tareas.filter(x => x.IdTransaccion == transaccion.IdTransaccion && x.CRUD != null);
        tareasSincronizar.forEach(async(tarea) => {
          await this.tareasService.update(idActividad, transaccion.IdTransaccion, tarea);
          tarea.CRUD =  null;;
          tarea.CRUDDate = null;
        });

        if (await this.integration.updateTransaccion(current) && current.Firma != null) {
          transaccion.CRUD = null;
          transaccion.CRUDDate = null;
          this.integration.uploadFirmaTransaccion(current);
        }

        await this.storage.set("Actividades", actividades);
      }
    }
  }
}
