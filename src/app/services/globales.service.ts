import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Actividad } from '../interfaces/actividad.interface';
import { Cuenta } from 'src/app/interfaces/cuenta.interface'
import { Estado, TipoServicio, EntradaSalida } from 'src/app/services/constants.service';
import { Transaccion } from '../interfaces/transaccion.interface';
import { IntegrationService } from './integration.service';
import { StorageService } from './storage.service';

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

  constructor(
    private storage: StorageService,
    private integration: IntegrationService,
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

  getResumen(tipoMedicion: string | null, tipoCaptura: string | null, cantidad: number,  unidadCantidad: string, peso: number, unidadPeso: string,  volumen: number, unidadVolumen: string) {
    let resumen: string = '';
    if (tipoMedicion == null || tipoMedicion == 'C' || tipoCaptura == 'C') {
      if (cantidad > 0){
        resumen += `${cantidad} ${unidadCantidad}`;
      }
    }
    if (tipoMedicion == null || tipoMedicion == 'P' || tipoCaptura == 'P'){
      if (peso > 0){
        if (resumen != '')
          resumen += `/${peso} ${unidadPeso}`;
        else
          resumen = `${peso} ${unidadPeso}`;
      }
    }
    if (tipoMedicion == null || tipoMedicion == 'V' || tipoCaptura == 'V') {
      if (volumen > 0){
        if (resumen != '')
          resumen += `/${volumen} ${unidadVolumen}`;
        else
          resumen = `${volumen} ${unidadVolumen}`;
      }
    }
    return resumen;
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
    const cuenta: Cuenta = await this.storage.get('Cuenta');

    const selectedServicio = cuenta.Servicios.find(x => x.IdServicio == idServicio);
    if (selectedServicio != null)
    {
      allow = true;
    }
    return allow;
  }
  // #endregion

  // #region Read Methods
  async getToken(): Promise<string> {
    const token: string = await this.storage.get('Token');
    return token;
  }

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

  async getPermiso(idOpcion: string): Promise<string> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    try {
      if (cuenta && cuenta.Puntos) {
        let permiso = cuenta.Permisos[idOpcion] || '';
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

  async getTareaTransaccion(idActividad: string, idTransaccion: string): Promise<Transaccion | undefined> {
    let transaccion: Transaccion | undefined = undefined;
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad)
    {
      transaccion = actividad.Transacciones.find((trx) => trx.IdTransaccion == idTransaccion);
    }
    return transaccion;
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
