import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Actividad } from '../interfaces/actividad.interface';
import { Cuenta } from 'src/app/interfaces/cuenta.interface'
import { Estado, TipoServicio, EntradaSalida } from 'src/app/services/constants.service';
import { Transaccion } from '../interfaces/transaccion.interface';
import { StorageService } from './storage.service';
import { Servicio } from '../interfaces/servicio.interface';
import { Tarea } from '../interfaces/tarea.interface';

@Injectable({
  providedIn: 'root',
})
export class Globales {
  estados: { IdEstado: string, Nombre: string, Color: string }[]  = [
    {IdEstado: Estado.Aprobado, Nombre:'Aprobado', Color:'success'},
    {IdEstado: Estado.Pendiente, Nombre:'Pendiente',Color:'warning'},
    {IdEstado: Estado.Rechazado, Nombre:'Rechazado',Color:'danger'},
    {IdEstado: Estado.Finalizado, Nombre:'Finalizado', Color:'secondary'},
    {IdEstado: Estado.Inactivo, Nombre:'Opcional', Color:'light'},
  ];
  servicios: {IdServicio: string, Nombre: string, Accion: string, Icono: string} [] = [
    {IdServicio:TipoServicio.Acopio, Nombre:'Acopio', Accion: 'Almacenamiento temporal', Icono: '../../assets/icon/warehouse.svg'},
    {IdServicio:TipoServicio.Almacenamiento, Nombre:'Almacenamiento', Accion: 'Almacenamiento definitivo', Icono:'../../assets/icon/archive.svg'},
    {IdServicio:TipoServicio.Aprovechamiento, Nombre:'Aprovechamiento', Accion: 'Aprovechamiento de Residuos', Icono: '../../assets/icon/sell.svg'},
    {IdServicio:TipoServicio.Pretratamiento, Nombre:'Pretratamiento', Accion: 'Clasificación / Separación', Icono: '../../assets/icon/household.svg'},
    {IdServicio:TipoServicio.Disposicion, Nombre:'Disposición', Accion: 'Disposición de Residuos', Icono: '../../assets/icon/fire.svg'},
    {IdServicio:TipoServicio.Generacion, Nombre:'Generación', Accion: 'Producción', Icono: '../../assets/icon/recycle-bag.svg'},
    {IdServicio:TipoServicio.Entrega, Nombre:'Entrega', Accion: 'Entrega', Icono: 'archive'},
    {IdServicio:TipoServicio.Recepcion, Nombre:'Recepción', Accion: 'Recepción', Icono: 'open'},
    {IdServicio:TipoServicio.Recoleccion, Nombre:'Recolección', Accion: 'Recolección sin vehículo', Icono: '../../assets/icon/forklift.svg'},
    {IdServicio:TipoServicio.Tratamiento, Nombre:'Transformación', Accion: 'Transformación', Icono: '../../assets/icon/construct.svg'},
    {IdServicio:TipoServicio.Transporte, Nombre:'Transporte', Accion: 'Transporte', Icono: '../../assets/icon/truck.svg'},
  ];
  public token: string = 'un';
  public mostrarIntroduccion: boolean = false;
  public unidadCantidad: string = 'un';
  public unidadPeso: string = 'kg';
  public unidadVolumen: string = 'lt';
  public permisos:  {[key: string]: string | null;} = {};

  constructor(
    private storage: StorageService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) {}

  //#region Auxiliares
  newId(): string {
    return uuidv4();
  }

  today(): Date {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(),ahora.getDay());

    return hoy;
  }

  verificarFechaJornada(fechaHoraInicial: Date | null, fechaHoraFinal: Date | null, fechaHoraAVerificar: Date): boolean {
    if (fechaHoraInicial == null)
      fechaHoraInicial = new Date();

    const fechaFinal = fechaHoraFinal || new Date();

    return (
      fechaHoraAVerificar >= fechaHoraInicial && fechaHoraAVerificar <= fechaFinal
    );
  }

  getResumenCantidadesResiduo(tipoMedicion: string | null, tipoCaptura: string | null, cantidad: number,  peso: number, volumen: number): string {
    let resumen: string = '';
    if (tipoMedicion == null || tipoMedicion == 'C' || tipoCaptura == 'C') {
      if (cantidad > 0){
        resumen += `${cantidad} ${this.unidadCantidad}`;
      }
    }
    if (tipoMedicion == null || tipoMedicion == 'P' || tipoCaptura == 'P'){
      if (peso > 0){
        if (resumen != '')
          resumen += `/${peso} ${this.unidadPeso}`;
        else
          resumen = `${peso} ${this.unidadPeso}`;
      }
    }
    if (tipoMedicion == null || tipoMedicion == 'V' || tipoCaptura == 'V') {
      if (volumen > 0){
        if (resumen != '')
          resumen += `/${volumen} ${this.unidadVolumen}`;
        else
          resumen = `${volumen} ${this.unidadVolumen}`;
      }
    }
    return resumen;
  }

  getResumenCantidadesTarea(cantidad: number,  peso: number, volumen: number): string {

    let resumen: string = '';
    if (cantidad > 0){
      resumen += `${cantidad} ${this.unidadCantidad}`;
    }
    if (peso > 0){
      if (resumen != '')
        resumen += `/${peso} ${this.unidadPeso}`;
      else
        resumen = `${peso} ${this.unidadPeso}`;
    }
    if (volumen > 0){
      if (resumen != '')
        resumen += `/${volumen} ${this.unidadVolumen}`;
      else
        resumen = `${volumen} ${this.unidadVolumen}`;
    }
    return resumen;
  }

  getContadorEstadosItems(tareas: Tarea[]): { aprobados: number; pendientes: number; rechazados: number } {
      const resultado = tareas.reduce(
        (acumulador, tarea) => {
          if (tarea.IdEstado === Estado.Aprobado) {
            acumulador.aprobados += 1;
          } else if (tarea.IdEstado === Estado.Pendiente) {
            acumulador.pendientes += 1;
          } else if (tarea.IdEstado === Estado.Rechazado) {
            acumulador.rechazados += 1;
          }
          return acumulador;
        },
        { aprobados: 0, pendientes: 0, rechazados: 0 }
      );
      return resultado;
  }

  getSumatoriaCantidades(tareas: Tarea[]): { cantidad: number; peso: number; volumen: number } {
    const resultado = tareas.reduce(
      (acumulador, tarea) => {
        if (tarea.IdEstado === Estado.Aprobado) {
          acumulador.cantidad += tarea.Cantidad ?? 0;
          acumulador.peso += tarea.Peso ?? 0;
          acumulador.volumen += tarea.Volumen ?? 0;
        }
        return acumulador;
      },
      { cantidad: 0, peso: 0, volumen: 0 }
    );
    return resultado;
  }

  getResumen(tareas: Tarea[]): {
    resumen: string;
    aprobados: number;
    pendientes: number;
    rechazados: number;
    cantidad: number;
    peso: number;
    volumen: number;
  } {
    const estados = { aprobados: 0, pendientes: 0, rechazados: 0 };
    const sumatoria = { cantidad: 0, peso: 0, volumen: 0 };
    let resumen = '';

    tareas.forEach(tarea => {
      // Contador de estados
      if (tarea.IdEstado === Estado.Aprobado) {
        estados.aprobados += 1;
      } else if (tarea.IdEstado === Estado.Pendiente) {
        estados.pendientes += 1;
      } else if (tarea.IdEstado === Estado.Rechazado) {
        estados.rechazados += 1;
      }

      if (tarea.IdEstado === Estado.Aprobado) {
        sumatoria.cantidad += tarea.Cantidad ?? 0;
        sumatoria.peso += tarea.Peso ?? 0;
        sumatoria.volumen += tarea.Volumen ?? 0;
      }
    });

    if (sumatoria.cantidad > 0) {
      resumen += `${sumatoria.cantidad} ${this.unidadCantidad}`;
    }
    if (sumatoria.peso > 0) {
      if (resumen !== '') {
        resumen += `/${sumatoria.peso} ${this.unidadPeso}`;
      } else {
        resumen = `${sumatoria.peso} ${this.unidadPeso}`;
      }
    }
    if (sumatoria.volumen > 0) {
      if (resumen !== '') {
        resumen += `/${sumatoria.volumen} ${this.unidadVolumen}`;
      } else {
        resumen = `${sumatoria.volumen} ${this.unidadVolumen}`;
      }
    }

    return {
      resumen: resumen,
      aprobados: estados.aprobados,
      pendientes: estados.pendientes,
      rechazados: estados.rechazados,
      cantidad: sumatoria.cantidad,
      peso: sumatoria.peso,
      volumen: sumatoria.volumen
    };
  }

  getAccionEntradaSalida(entradaSalida: string): string {
    let accion: string = '';

    switch (entradaSalida)
    {
      case EntradaSalida.Entrada:
        accion = 'Recoger';
        break;
      case EntradaSalida.Salida:
        accion = 'Entregar';
        break;
      case EntradaSalida.Transferencia:
        accion = 'Recoger y Entregar';
        break;
    }
    return accion;
  }

  async allowServicio(idServicio: string): Promise<boolean> {
    let allow: boolean = false;
    const servicios: Servicio[] = await this.storage.get('Servicios');

    const selectedServicio = servicios.find(x => x.IdServicio == idServicio);
    if (selectedServicio != null)
    {
      allow = true;
    }
    return allow;
  }
  // #endregion

  // #region Read Methods
  getColorEstado(idEstado: string): string{
    const estado = this.estados.find((estado) => estado.IdEstado == idEstado);
    return estado? estado.Color : 'light';
  }

  async getCuenta(): Promise<Cuenta> {
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    return cuenta;
  }

  async getIdPersona(): Promise<string | null> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');
    return cuenta.Identificacion;
  }

  getImagen(id: string): string{
    const img = this.servicios.find((imagen) => imagen.IdServicio.toString() == id);
    return img? img.Icono : '';
  }


  getNombreEstado(idEstado: string): string{
    const estado = this.estados.find((estado) => estado.IdEstado == idEstado);
    return estado? estado.Nombre : 'Pendiente';
  }

  getNombreServicio(idServicio: string) {
    let procesoNombre: string = '';

    const proceso = this.servicios.find((prc) => prc.IdServicio === idServicio);
    if (proceso)
      procesoNombre = proceso.Nombre;

    return procesoNombre;
  }

  getPermiso(idOpcion: string): string {
    try {
      if (this.permisos) {
        let permiso = this.permisos[idOpcion] || '';
        if (permiso == null)
          permiso = '';
        return permiso;
      } else {
        return '';
      }
    } catch {
      return '';
    }
  }

  // #endregion

  // #region Update Methods


  ///Modifica la solicitud/item o la tarea correspondiente
  // #region Loading panel
  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async presentToast(message: string, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  hideLoading(){
    this.loadingCtrl.dismiss();
  }

  async showLoading(message: string) {
    const loading = await this.loadingCtrl.create({ message: message });
    await loading.present();
  }
  // #endregion
}
