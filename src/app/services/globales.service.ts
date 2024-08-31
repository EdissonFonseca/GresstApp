import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Actividad } from '../interfaces/actividad.interface';
import { Cuenta } from 'src/app/interfaces/cuenta.interface'
import { Embalaje } from '../interfaces/embalaje.interface';
import { Estado, TipoServicio, EntradaSalida, CRUDOperacion } from 'src/app/services/constants.service';
import { Insumo } from '../interfaces/insumo.interface';
import { Material } from '../interfaces/material.interface';
import { Punto } from '../interfaces/punto.interface';
import { Residuo } from '../interfaces/residuo.interface';
import { Servicio } from '../interfaces/servicio.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Tratamiento } from '../interfaces/tratamiento.interface';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { IntegrationService } from './integration.service';
import { StorageService } from './storage.service';
import { Photo } from '@capacitor/camera';

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

  async addServicio(idServicio: string) {
    const cuenta: Cuenta = await this.storage.get('Cuenta');

    const selectedServicio = this.servicios.find(x => x.IdServicio == idServicio);
    if (selectedServicio != null)
    {
      const servicio: Servicio = { IdServicio: idServicio, Nombre: selectedServicio.Nombre, CRUDDate: new Date() };
      cuenta.Servicios.push(servicio);
      await this.storage.set('Cuenta', cuenta);
    }
  }

  async createEmbalaje(embalaje: Embalaje): Promise<boolean> {
    try{
      const posted = await this.integration.postEmbalaje(embalaje);
      if (!posted) {
        embalaje.CRUD = CRUDOperacion.Create;
        embalaje.CRUDDate = new Date();
      }
    } catch {
      embalaje.CRUD = CRUDOperacion.Create;
      embalaje.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const cuenta: Cuenta = await this.storage.get('Cuenta');
      cuenta.Embalajes.push(embalaje);
      await this.storage.set('Cuenta', cuenta);
    }
    return true;
  }

  async createInsumo(insumo: Insumo): Promise<boolean> {
    try{
      const posted = await this.integration.postInsumo(insumo);
      if (!posted) {
        insumo.CRUD = CRUDOperacion.Create;
        insumo.CRUDDate = new Date();
      }
    } catch {
      insumo.CRUD = CRUDOperacion.Create;
      insumo.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const cuenta: Cuenta = await this.storage.get('Cuenta');
      cuenta.Insumos.push(insumo);
      await this.storage.set('Cuenta', cuenta);
    }
    return true;
  }

  async createMaterial(material: Material): Promise<boolean> {
    try{
      const posted = await this.integration.postMaterial(material);
      if (!posted) {
        material.CRUD = CRUDOperacion.Create;
        material.CRUDDate = new Date();
      }
    } catch {
      material.CRUD = CRUDOperacion.Create;
      material.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const cuenta: Cuenta = await this.storage.get('Cuenta');
      cuenta.Materiales.push(material);
      await this.storage.set('Cuenta', cuenta);
    }
    return true;
  }

  async createTercero(tercero: Tercero): Promise<boolean> {
    try{
      const posted = await this.integration.postTercero(tercero);
      if (!posted) {
        tercero.CRUD = CRUDOperacion.Create;
        tercero.CRUDDate = new Date();
      }
    } catch {
      tercero.CRUD = CRUDOperacion.Create;
      tercero.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const cuenta: Cuenta = await this.storage.get('Cuenta');
      cuenta.Terceros.push(tercero);
      await this.storage.set('Cuenta', cuenta);
    }
    return true;
  }

  async createResiduo(residuo: Residuo) {
    let inventario: Residuo[] = await this.storage.get('Inventario');

    if (!inventario)
      inventario = [];
    inventario.push(residuo);
    await this.storage.set('Inventario', inventario);
  }

  // #endregion

  // #region Read Methods
  async getUser(): Promise<string> {
    const token: string = await this.storage.get('Token');
    return token;
  }

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

  async getEmbalaje(idEmbalaje: string): Promise<Embalaje | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Embalajes) {
      const embalaje = cuenta.Embalajes.find((embalaje) => embalaje.IdEmbalaje === idEmbalaje);
      return embalaje || undefined;
    }

    return undefined;
  }

  async getEmbalajes(): Promise<Embalaje[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');
    const embalajes = cuenta.Embalajes.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    return embalajes;
  }

  async getIdPersona(): Promise<string | null> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');
    return cuenta.Identificacion;
  }

  getImagen(id: string): string{
    const img = this.servicios.find((imagen) => imagen.IdServicio.toString() == id);
    return img? img.Icono : '';
  }

  async getInsumos(): Promise<Insumo[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Insumos;
  }

  async getInventario(): Promise<Residuo[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const residuos: Residuo[] = await this.storage.get('Inventario');
    const materiales = await this.getMateriales();
    const terceros = await this.getTerceros();
    const puntos = await this.getPuntos();
    let ubicacion: string = '';
    let cantidades: string = '';

    residuos.forEach((residuo) => {
      const material = materiales.find((x) => x.IdMaterial == residuo.IdMaterial);
      const tercero = terceros.find(x => x.IdTercero == residuo.IdPropietario);
      const punto = puntos.find(x => x.IdPunto == residuo.IdDepositoOrigen);
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
        const deposito = puntos.find(x => x.IdPunto == residuo.IdDeposito);
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
        cantidades += `${residuo.Cantidad} ${cuenta.UnidadCantidad}`;
      }
      if (residuo.Peso ?? 0 > 0){
        if (cantidades != '')
          cantidades += `/${residuo.Peso} ${cuenta.UnidadPeso}`;
        else
          cantidades = `${residuo.Peso} ${cuenta.UnidadPeso}`;
      }
      if (residuo.Volumen ?? 0 > 0){
        if (cantidades != '')
          cantidades += `/${residuo.Volumen} ${cuenta.UnidadVolumen}`;
        else
          cantidades = `${residuo.Volumen} ${cuenta.UnidadVolumen}`;
      }
      residuo.Cantidades = cantidades;
    });

    return residuos;
  }

  async getMaterial(idMaterial: string): Promise<Material | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Materiales) {
      const material = cuenta.Materiales.find((material) => material.IdMaterial === idMaterial);
      return material || undefined;
    }

    return undefined;
  }

  async getMateriales(): Promise<Material[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Materiales;
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

  async getPunto(idPunto: string): Promise<Punto | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Puntos) {
      const punto = cuenta.Puntos.find((punto) => punto.IdPunto === idPunto);
      return punto || undefined;
    }

    return undefined;
  }

  async getPuntos(): Promise<Punto[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Puntos;
  }

  async getPuntosFromTareas(idActividad: string){
    let puntos: Punto[] = [];
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad.Tareas)
    {
      const tareasPuntos = actividad.Tareas.filter((x) => x.IdPunto != null);
      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdPunto ?? '');
      puntos = cuenta.Puntos.filter((punto) => idsPuntos.includes(punto.IdPunto));
    }
    return puntos;
  }

  async getPuntosFromTareasPendientes(idActividad: string){
    let puntos: Punto[] = [];
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad.Tareas)
    {
      const tareasPuntos = actividad.Tareas.filter((x) => x.IdPunto != null && x.IdEstado == Estado.Pendiente);
      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdPunto ?? '');
      puntos = cuenta.Puntos.filter((punto) => idsPuntos.includes(punto.IdPunto));
    }
    return puntos;
  }

  async getResiduo(idResiduo: string): Promise<Residuo | undefined> {
    const inventario: Residuo[] = await this.getInventario();

    if (inventario)
    {
      const residuoInventario = inventario.find(x => x.IdResiduo == idResiduo);
      return residuoInventario;
    }

    return undefined;
  }

  async getServicio(idServicio: string): Promise<Servicio | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Servicios) {
      const servicio = cuenta.Servicios.find((servicio) => servicio.IdServicio === idServicio);
      return servicio || undefined;
    }

    return undefined;
  }

  async getServicios(): Promise<Servicio[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Servicios;
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

  async getTercero(idTercero: string): Promise<Tercero | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Terceros) {
      const tercero = cuenta.Terceros.find((tercero) => tercero.IdTercero === idTercero);
      return tercero || undefined;
    }

    return undefined;
  }

  async getTerceros(): Promise<Tercero[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Terceros;
  }

  async getTercerosConPuntos(): Promise<Tercero[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    const idTerceros: string[] = cuenta.Puntos.map(x => x.IdTercero ?? '');

    return cuenta.Terceros.filter(x=> idTerceros.includes(x.IdTercero));
  }

  async getTratamiento(idTratamiento: string): Promise<Tratamiento | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Tratamientos) {
      const tratamiento = cuenta.Tratamientos.find((tratamiento) => tratamiento.IdTratamiento === idTratamiento);
      return tratamiento || undefined;
    }

    return undefined;
  }

  async getTratamientos(): Promise<Tratamiento[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Tratamientos;
  }

  async getVehiculos(): Promise<Vehiculo[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Vehiculos;
  }
  // #endregion

  // #region Update Methods


  ///Modifica la solicitud/item o la tarea correspondiente


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

  // #endregion

  async deleteServicio(idServicio: string) {
    const cuenta: Cuenta = await this.storage.get('Cuenta');

    const servicios = cuenta.Servicios.filter(x=> x.IdServicio !== idServicio);
    cuenta.Servicios = servicios;
    await this.storage.set('Cuenta', cuenta);
  }


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
