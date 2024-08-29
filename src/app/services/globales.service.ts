import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Actividad } from '../interfaces/actividad.interface';
import { Cuenta } from 'src/app/interfaces/cuenta.interface'
import { Embalaje } from '../interfaces/embalaje.interface';
import { Estado, TipoMedicion, TipoServicio, EntradaSalida, CRUDOperacion } from 'src/app/services/constants.service';
import { Insumo } from '../interfaces/insumo.interface';
import { Material } from '../interfaces/material.interface';
import { Punto } from '../interfaces/punto.interface';
import { Residuo } from '../interfaces/residuo.interface';
import { Servicio } from '../interfaces/servicio.interface';
import { Tarea } from '../interfaces/tarea.interface';
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

  async sincronizar() {
    let cuenta: Cuenta = await this.storage.get('Cuenta');
    let actividades: Actividad[] = await this.storage.get('Actividades');
    let inventario: Residuo[] = await this.storage.get('Inventario');

    try {
      // //TODO -> Faltan modificaciones y borrados de insumose
      // const insumosCrear = cuenta.Insumos.filter(x => x.CRUD == CRUDOperacion.Create);
      // insumosCrear.forEach(async(insumo) => {
      //   await this.integration.postInsumo(insumo);
      //   insumo.CRUD = null;
      //   insumo.CRUDDate = null;
      // });

      // const embalajesCrear = cuenta.Embalajes.filter(x => x.CRUD == CRUDOperacion.Create);
      // embalajesCrear.forEach(async(embalaje) => {
      //   await this.integration.postEmbalaje(embalaje);
      //   embalaje.CRUD = null;
      //   embalaje.CRUDDate = null;
      // });

      // const tratamientosCrear = cuenta.Tratamientos.filter(x => x.CRUD == CRUDOperacion.Create);
      // tratamientosCrear.forEach(async(tratamiento) => {
      //   await this.integration.postTratamiento(tratamiento);
      //   tratamiento.CRUD = null;
      //   tratamiento.CRUDDate = null;
      // });

      // const materialesCrear = cuenta.Materiales.filter(x => x.CRUD == CRUDOperacion.Create);
      // materialesCrear.forEach(async(material) => {
      //   await this.integration.postMaterial(material);
      //   material.CRUD = null;
      //   material.CRUDDate = null;
      // });

      // const tercerosCrear = cuenta.Terceros.filter(x => x.CRUD == CRUDOperacion.Create);
      // tercerosCrear.forEach(async(tercero) => {
      //   await this.integration.postTercero(tercero);
      //   tercero.CRUD = null;
      //   tercero.CRUDDate = null;
      // });

      // const puntosCrear = cuenta.Puntos.filter(x => x.CRUD == CRUDOperacion.Create);
      // puntosCrear.forEach(async(punto) => {
      //   await this.integration.postPunto(punto);
      //   punto.CRUD = null;
      //   punto.CRUDDate = null;
      // });

      try
      {
        if (actividades)
        {
          const actividadesPendientes = actividades.filter(x => x.CRUD != null);
          actividadesPendientes.forEach(async(actividad) => {
            await this.updateActividad(actividad);
          });
        }
      } catch {}

      cuenta = await this.integration.getConfiguracion();
      await this.storage.set('Cuenta', cuenta);

      actividades = await this.integration.getActividades();
      await this.storage.set('Actividades', actividades);

      inventario = await this.integration.getInventario();
      await this.storage.set('Inventario', inventario);

    } catch (error){
      throw (error);
    }
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

  getIconoTransaccion(idPunto: string): string {
    let icono: string = 'person';

    if (idPunto)
      icono = 'location';

    return icono;
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

  async markPosted(cuenta: Cuenta){
    cuenta.Embalajes.forEach(x => x.CRUD = '');
    cuenta.Insumos.forEach(x => x.CRUD = '');
  }

  // #region Create Methods
  async createActividad(actividad: Actividad) {
    const actividades: Actividad[] = await this.storage.get('Actividades');

    actividades.push(actividad);
    await this.storage.set('Actividades', actividades);
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

  async createTarea(idActividad: string, tarea: Tarea) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad = actividades.find(x => x.IdActividad == idActividad);
    if (actividad){
      actividad.Tareas.push(tarea);
      await this.storage.set('Actividades', actividades);

      if (await this.integration.createTarea(tarea)){
        await this.integration.uploadFotosTarea(tarea);
      }

    }
  }

  async createTransaccion(idActividad: string, transaccion: Transaccion) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad = actividades.find(x => x.IdActividad == idActividad);
    if (actividad) {
      actividad.Transacciones.push(transaccion);
      await this.storage.set('Actividades', actividades);
    }
  }

  // #endregion

  // #region Read Methods
  async getActividad(idActividad: string): Promise<Actividad> {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    return actividad;
  }

  async getUser(): Promise<string> {
    const token: string = await this.storage.get('Token');
    return token;
  }

  async getToken(): Promise<string> {
    const token: string = await this.storage.get('Token');
    return token;
  }

  async getActividades(): Promise<Actividad[]> {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    let cantidad: number;
    let peso: number;
    let volumen: number;
    let aprobados: number;
    let pendientes: number;
    let rechazados: number;
    let resumen: string;

    actividades.forEach((actividad) => {
      const tareas = actividad.Tareas;

      aprobados = pendientes = rechazados = peso = 0;
      resumen = '';
      aprobados = tareas.reduce((contador, tarea) => {
        if (tarea.IdEstado == Estado.Aprobado)
          return contador + 1;
        else
          return contador;
      }, 0);
      pendientes = tareas.reduce((contador, tarea) => {
        if (tarea.IdEstado == Estado.Pendiente)
          return contador + 1;
        else
          return contador;
      }, 0);
      rechazados = tareas.reduce((contador, tarea) => {
        if (tarea.IdEstado == Estado.Rechazado)
          return contador + 1;
        else
          return contador;
      }, 0);
      cantidad = tareas.reduce((cantidad, tarea) => {
        if (tarea.IdEstado == Estado.Aprobado){
          if (tarea.EntradaSalida == EntradaSalida.Entrada)
            return cantidad + (tarea.Cantidad ?? 0);
          else
            return cantidad - (tarea.Cantidad ?? 0);
        }
        else {
          return cantidad;
        }
      }, 0);
      peso = tareas.reduce((peso, tarea) => {
        if (tarea.IdEstado == Estado.Aprobado){
          if (tarea.EntradaSalida == EntradaSalida.Entrada)
            return peso + (tarea.Peso ?? 0);
          else
            return peso - (tarea.Peso ?? 0);
        }
        else {
          return peso;
        }
      }, 0);
      volumen = tareas.reduce((volumen, tarea) => {
        if (tarea.IdEstado == Estado.Aprobado){
          if (tarea.EntradaSalida == EntradaSalida.Entrada)
            return volumen + (tarea.Volumen ?? 0);
          else
          return volumen - (tarea.Volumen ?? 0);
        }
        else {
          return volumen;
        }
      }, 0);
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

      actividad.ItemsAprobados = aprobados;
      actividad.ItemsPendientes = pendientes;
      actividad.ItemsRechazados = rechazados;
      actividad.Cantidades = resumen;
      actividad.Icono = this.servicios.find((servicio) => actividad.IdServicio == servicio.IdServicio)?.Icono ||'';
      actividad.Accion = this.servicios.find((servicio) => actividad.IdServicio == servicio.IdServicio)?.Nombre || '';
    });

    return actividades;
  }

  async getActividadByServicio(idServicio: string, idRecurso: string) : Promise<Actividad | undefined>{
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdServicio == idServicio && item.IdRecurso == idRecurso)!;
    return actividad;
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
        const permiso = cuenta.Permisos[idOpcion] || '';
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

  async getTarea(idActividad: string, idTransaccion: string, idTarea: string): Promise<Tarea | undefined> {
    const tareas: Tarea[]= await this.getTareas(idActividad);
    let tarea: Tarea | undefined = undefined;

    if (tareas)
        tarea = tareas.find((tarea) => tarea.IdTransaccion == idTransaccion && tarea.IdTarea == idTarea);
    return tarea;
  }

  async getTareas(idActividad: string): Promise<Tarea[]>{
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    const materiales = await this.getMateriales();
    const tratamientos = await this.getTratamientos();
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

  async getTareasSugeridas(idActividad: string, idTransaccion: string){
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

    const materiales = await this.getMateriales();
    const tratamientos = await this.getTratamientos();
    const embalajes = await this.getEmbalajes();

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
            resumen = this.getResumen(material.TipoMedicion, material.TipoCaptura, tarea.Cantidad ?? 0, cuenta.UnidadCantidad, tarea.Peso?? 0, cuenta.UnidadPeso, tarea.Volumen ?? 0, cuenta.UnidadVolumen);
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
        const puntos = await this.getPuntos();
        var transaccion = actividad.Transacciones.find(x => x.IdTransaccion == idTransaccion);
        if (transaccion && transaccion.IdPunto)
        {
          var punto = await this.getPunto(transaccion.IdPunto);
          if (punto){
            punto.IdMateriales?.forEach((idMaterial) => {
              const tareaMaterial = tareas.find(x => x.IdMaterial == idMaterial);
              if (!tareaMaterial) {
                const material = materiales.find((x) => x.IdMaterial == idMaterial);

                if (material){
                  const tarea: Tarea = {
                    IdTarea: this.newId(),
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
          const residuos = (await this.getInventario()).filter(x => x.IdVehiculo == actividad.IdRecurso);
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
                  IdTarea: this.newId(),
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

  async getTransaccion(idActividad: string, idTransaccion: string) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    let transaccion: Transaccion | undefined;

    if (actividad)
      transaccion = actividad.Transacciones.find(x => x.IdTransaccion == idTransaccion)!;

    return transaccion;
  }

  async getTransaccionByPunto(idActividad: string, idPunto: string) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    let transaccion: Transaccion | undefined;

    if (actividad) {
      transaccion = actividad.Transacciones.find(x => x.IdPunto == idPunto)!;
    }
    return transaccion;
  }

  async getTransaccionByTercero(idActividad: string, idTercero: string) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    let transaccion: Transaccion | undefined = undefined;

    if (actividad)
    {
      transaccion = actividad.Transacciones.find(x => x.IdTercero == idTercero)!;
    }
    return transaccion;
  }

  async getTransacciones(idActividad: string){
    let nombre: string = '';
    let operacion: string = '';
    let ubicacion: string = '';
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    const transacciones: Transaccion[] = actividad.Transacciones;
    const puntos = await this.getPuntos();
    const terceros = await this.getTerceros();
    const tareas: Tarea[] = await this.getTareas(idActividad);
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
      transaccion.Accion = this.getAccionEntradaSalida(operacion ?? '');
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
  async updateActividad(actividad: Actividad) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const current: Actividad = actividades.find((item) => item.IdActividad == actividad.IdActividad)!;
    if (current)
    {
      current.IdEstado = actividad.IdEstado;
      current.IdentificacionResponsable = actividad.IdentificacionResponsable;
      current.NombreResponsable = actividad.NombreResponsable;
      current.Observaciones = actividad.Observaciones;
      current.Firma = actividad.Firma;

      const transaccionesSincronizar = actividad.Transacciones.filter(x => x.CRUD != null);
      transaccionesSincronizar.forEach(async(transaccion) => {
        console.log(`Sincronizar transaccion ${transaccion.IdTransaccion}`);

        const tareasSincronizar = actividad.Tareas.filter(x => x.IdTransaccion == transaccion.IdTransaccion && x.CRUD != null);
        tareasSincronizar.forEach(async(tarea) => {
          console.log(`Sincronizar tarea ${tarea.IdTarea}`);
          await this.updateTarea(actividad.IdActividad, transaccion.IdTransaccion, tarea);
          tarea.CRUD =  null;;
          tarea.CRUDDate = null;
        });

        const tareasRechazar = actividad.Tareas.filter(x => x.IdTransaccion == transaccion.IdTransaccion && x.CRUD == null && x.IdEstado == Estado.Pendiente);
        tareasRechazar.forEach(async(tarea) => {
          console.log(`Rechazar tarea ${tarea.IdTarea}`);
          tarea.IdEstado = Estado.Rechazado;
          await this.updateTarea(actividad.IdActividad, transaccion.IdTransaccion, tarea);
          tarea.CRUD =  null;;
          tarea.CRUDDate = null;
        });

        await this.updateTransaccion(actividad.IdActividad, transaccion);
        transaccion.CRUD =  null;;
        transaccion.CRUDDate = null;
      });

      const transaccionesRechazar = actividad.Transacciones.filter(x => x.CRUD == null && x.IdEstado == Estado.Pendiente);
      transaccionesRechazar.forEach(async(transaccion) => {
          const tareasSincronizar = actividad.Tareas.filter(x => x.IdTransaccion == transaccion.IdTransaccion && x.CRUD != null);
          tareasSincronizar.forEach(async(tarea) => {
            console.log(`Sincronizar tarea ${tarea.IdTarea}`);
            await this.updateTarea(actividad.IdActividad, transaccion.IdTransaccion, tarea);
            tarea.CRUD =  null;;
            tarea.CRUDDate = null;
          });

          const tareasRechazar = actividad.Tareas.filter(x => x.IdTransaccion == transaccion.IdTransaccion && x.CRUD == null && x.IdEstado == Estado.Pendiente);
          tareasRechazar.forEach(async(tarea) => {
            tarea.IdEstado = Estado.Rechazado;
            await this.updateTarea(actividad.IdActividad, transaccion.IdTransaccion, tarea);
            tarea.CRUD =  null;;
            tarea.CRUDDate = null;
          });

          transaccion.IdEstado = Estado.Rechazado;
          await this.updateTransaccion(actividad.IdActividad, transaccion);
          transaccion.CRUD =  null;;
          transaccion.CRUDDate = null;
        }
      );

      if (await this.integration.updateActividad(current) && current.Firma != null) {
        this.integration.uploadFirmaActividad(current);
      }
  }
    await this.storage.set("Actividades", actividades);
  }

  async updateTransaccion(idActividad: string, transaccion: Transaccion) {
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
          await this.updateTarea(idActividad, transaccion.IdTransaccion, tarea);
          tarea.CRUD =  null;;
          tarea.CRUDDate = null;
        });

        const tareasRechazar = actividad.Tareas.filter(x => x.IdTransaccion == transaccion.IdTransaccion && x.CRUD == null && x.IdEstado == Estado.Pendiente);
        tareasRechazar.forEach(async(tarea) => {
          tarea.IdEstado = Estado.Rechazado;
          await this.updateTarea(idActividad, transaccion.IdTransaccion, tarea);
          tarea.CRUD =  null;;
          tarea.CRUDDate = null;
        });
        console.log("Confirmar transaccion");
        console.log(current);
        if (await this.integration.updateTransaccion(current) && current.Firma != null) {
          this.integration.uploadFirmaTransaccion(current);
        }

        await this.storage.set("Actividades", actividades);
      }
    }
  }

  ///Modifica la solicitud/item o la tarea correspondiente
  async updateTarea(idActividad: string, idTransaccion: string, tarea: Tarea) {
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

        if (await this.integration.updateTarea(tareaUpdate)){
          await this.integration.uploadFotosTarea(tareaUpdate);
          tarea.CRUD = null;
          tarea.CRUDDate = null;
        }
      }
    }

  }

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
