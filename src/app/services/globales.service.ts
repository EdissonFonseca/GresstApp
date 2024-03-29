import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { v4 as uuidv4 } from 'uuid';

import { Actividad } from '../interfaces/actividad.interface';
import { Cuenta } from 'src/app/interfaces/cuenta.interface'
import { Embalaje } from '../interfaces/embalaje.interface';
import { Estado, TipoProceso, TipoMedicion, TipoServicio, EntradaSalida, CRUDOperacion } from 'src/app/services/constants.service';
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
  procesos: {IdProceso: string, Nombre: string, Accion: string, Icono: string}[] = [
    {IdProceso:TipoProceso.Almacenamiento, Nombre:'Almacenamiento', Accion: 'Almacenar', Icono:'car'},
    {IdProceso:TipoProceso.Disposicion, Nombre:'Disposición', Accion: 'Disponer', Icono: 'flame'},
    {IdProceso:TipoProceso.Entrada, Nombre:'Entrada', Accion: 'Ingresar', Icono: 'download'},
    {IdProceso:TipoProceso.Generacion, Nombre:'Generación', Accion: 'Generar', Icono: 'archive'},
    {IdProceso:TipoProceso.Recoleccion, Nombre:'Recolección', Accion: 'Recoger', Icono: 'cart'},
    {IdProceso:TipoProceso.Transporte, Nombre:'Transporte', Accion: 'Transportar', Icono: 'car'},
    {IdProceso:TipoProceso.Traslado, Nombre:'Traslado', Accion: 'Trasladar', Icono: 'open'},
    {IdProceso:TipoProceso.Transformacion, Nombre:'Transformación', Accion: 'Transformar', Icono: 'construct'},
    {IdProceso:TipoProceso.Salida, Nombre:'Entrega', Accion: 'Entregar', Icono: 'upload'},
  ];
  acciones: {IdServicio: Number, Nombre: string, Accion: string}[] = [
    {IdServicio:TipoServicio.Almacenamiento, Nombre:'Almacenamiento', Accion: 'Almacenar'},
    {IdServicio:TipoServicio.Disposicion, Nombre:'Disposición', Accion: 'Disponer'},
    {IdServicio:TipoServicio.Pretratamiento, Nombre:'Pretratamiento', Accion: 'Clasificar'},
    {IdServicio:TipoServicio.Recepcion, Nombre:'Recepción', Accion: 'Recibir'},
    {IdServicio:TipoServicio.Transferencia, Nombre:'Transferencia', Accion: 'Entregar'},
    {IdServicio:TipoServicio.Tratamiento, Nombre:'Tratamiento', Accion: 'Tratar'},
    {IdServicio:TipoServicio.TrasladoTransporte, Nombre:'Transformación', Accion: 'Transformar'}, //Transformacion
    {IdServicio:TipoServicio.RecoleccionTransporte, Nombre:'Entrega', Accion: 'Entregar'}, //Salida
    {IdServicio:TipoServicio.Ajuste, Nombre:'Ajuste', Accion: 'Entregar'}, //Salida
    {IdServicio:TipoServicio.Conciliacion, Nombre:'Conciliacion', Accion: 'Entregar'}, //Salida
    {IdServicio:TipoServicio.Generacion, Nombre:'Generacion', Accion: 'Entregar'}, //Salida
    {IdServicio:TipoServicio.Traslado, Nombre:'Entrega', Accion: 'Entregar'}, //Salida
    {IdServicio:TipoServicio.TransferenciaTransporte, Nombre:'Entrega', Accion: 'Entregar'}, //Salida
    {IdServicio:TipoServicio.Recoleccion, Nombre:'Entrega', Accion: 'Entregar'}, //Salida
    {IdServicio:TipoServicio.Perdida, Nombre:'Entrega', Accion: 'Entregar'}, //Salida
  ];

  constructor(
    private storage: Storage,
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

  getResumen(cantidad: number,  unidadCantidad: string, peso: number, unidadPeso: string,  volumen: number, unidadVolumen: string) {
    let resumen: string = '';
    if (cantidad > 0){
      resumen += `${cantidad} ${unidadCantidad}`;
    }
    if (peso > 0){
      if (resumen != '')
        resumen += `/${peso} ${unidadPeso}`;
      else
        resumen = `${peso} ${unidadPeso}`;
    }
    if (volumen > 0){
      if (resumen != '')
        resumen += `/${volumen} ${unidadVolumen}`;
      else
        resumen = `${volumen} ${unidadVolumen}`;
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

  // #region Create Methods
  async createActividad(actividad: Actividad) {
    const actividades: Actividad[] = await this.storage.get('Actividades');

    actividades.push(actividad);
    await this.storage.set('Actividades', actividades);
  }

  async createEmbalaje(nombre: string): Promise<string> {
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const embalaje: Embalaje = { IdEmbalaje: this.newId(), Nombre: nombre, CRUD: CRUDOperacion.Create};
    cuenta.Embalajes.push(embalaje);
    await this.storage.set('Cuenta', cuenta);

    return embalaje.IdEmbalaje;
  }

  async createInsumo(nombre: string): Promise<string> {
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const insumo: Insumo = { IdInsumo: this.newId(), Nombre: nombre, CRUD: CRUDOperacion.Create, IdEstado: Estado.Activo };
    cuenta.Insumos.push(insumo);
    await this.storage.set('Cuenta', cuenta);

    return insumo.IdInsumo;
  }

  async createMaterial(material: Material) {
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    cuenta.Materiales.push(material);
    await this.storage.set('Cuenta', cuenta);
  }

  async createResiduo(residuo: Residuo) {
    const inventario: Residuo[] = await this.storage.get('Inventario');

    inventario.push(residuo);
    await this.storage.set('Inventario', inventario);
  }

  async createTarea(idActividad: string, tarea: Tarea) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad = actividades.find(x => x.IdActividad == idActividad);
    if (actividad){
      actividad.Tareas.push(tarea);
      await this.storage.set('Actividades', actividades);
    }
  }

  async createTercero(nombre: string, identificacion: string, telefono: string, correo: string): Promise<string> {
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const tercero: Tercero = {IdTercero: this.newId(), Nombre: nombre, Identificacion: identificacion, Telefono: telefono, Correo: correo, CRUD: CRUDOperacion.Create, IdRelaciones: []};
    cuenta.Terceros.push(tercero);
    await this.storage.set('Cuenta', cuenta);

    return tercero.IdTercero;
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
  getAccionProceso(idProceso: string): string{
    const prc = this.procesos.find((accion) => accion.IdProceso == idProceso);
    return prc? prc.Accion : '';
  }

  async getActividad(idActividad: string): Promise<Actividad> {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    return actividad;
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
      actividad.Icono = this.procesos.find((proceso) => actividad.IdProceso == proceso.IdProceso)?.Icono ||'';
      actividad.Accion = this.procesos.find((proceso) => actividad.IdProceso == proceso.IdProceso)?.Nombre || '';
    });

    return actividades;
  }

  async getActividadByProceso(idProceso: string, idRecurso: string) : Promise<Actividad | undefined>{
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdProceso == idProceso && item.IdRecurso == idRecurso)!;
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
    const img = this.procesos.find((imagen) => imagen.IdProceso == id);
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
        const actividad = actividades.find(x => x.IdProceso == TipoProceso.Recoleccion && x.IdRecurso == residuo.IdRuta);
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

  getNombreProceso(idProceso: string) {
    let procesoNombre: string = '';

    const proceso = this.procesos.find((prc) => prc.IdProceso === idProceso);
    if (proceso)
      procesoNombre = proceso.Nombre;

    return procesoNombre;
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
      tarea.IdProceso = actividad.IdProceso;
    });

    return tareas;
  }

  async getTareasSugeridas(idActividad: string, idTransaccion: string){
    let tareas: Tarea[] = [];
    let validarInventario: boolean;
    let crear: boolean;
    let embalaje: string;
    let accion: string;
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
        tareas.filter(x => x.EntradaSalida == EntradaSalida.Entrada || x.IdResiduo).forEach((tarea) => {
          tarea.IdProceso = actividad.IdProceso;
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

            switch(actividad.IdProceso){
              case TipoProceso.Recoleccion:
              case TipoProceso.Transporte:
              case TipoProceso.Traslado:
                if (tarea.EntradaSalida != 'E')
                  validarInventario = true;
                break;
              case TipoProceso.Salida:
                validarInventario = true;
                break;
            }
            resumen = this.getResumen(tarea.Cantidad ?? 0, cuenta.UnidadCantidad, tarea.Peso?? 0, cuenta.UnidadPeso, tarea.Volumen ?? 0, cuenta.UnidadVolumen);
            switch(tarea.IdProceso){
              case TipoProceso.Almacenamiento:
                accion = 'Almacenar';
                break;
              case TipoProceso.Disposicion:
                accion = tarea.Tratamiento ?? 'Disponer';
                break;
              case TipoProceso.Entrada:
                accion = 'Recibir';
                break;
                case TipoProceso.Generacion:
                  accion = 'Generar';
                  break;
                case TipoProceso.Inventario:
                accion = 'Inventario';
                break;
              case TipoProceso.Recoleccion:
              case TipoProceso.Transporte:
              case TipoProceso.Traslado:
                if (tarea.EntradaSalida == 'E'){
                  accion = 'Recoger';
                } else {
                  accion = 'Entregar';
                }
                break;
              case TipoProceso.Salida:
                accion = 'Entregar';
                break;
              case TipoProceso.Transformacion:
                accion = tarea.Tratamiento ?? 'Transformar';
                break;
            }
            tarea.Accion = accion;
            tarea.Cantidades = resumen;
            tarea.Embalaje = embalaje;
          }
        });
      }
      if ((actividad.IdProceso == TipoProceso.Recoleccion || actividad.IdProceso == TipoProceso.Transporte) && idTransaccion) { //las tareas corresponden a la configuracion si es una ruta
        const puntos = this.getPuntos();
        var transaccion = actividad.Transacciones.find(x => x.IdTransaccion == idTransaccion);
        if (transaccion && transaccion.IdPunto)
        {
          var punto = await this.getPunto(transaccion.IdPunto);
          if (punto){
            punto.IdMateriales.forEach((idMaterial) => {
              const tareaMaterial = tareas.find(x => x.IdMaterial == idMaterial);
              if (!tareaMaterial) {
                const material = materiales.find((x) => x.IdMaterial == idMaterial);

                if (material){
                  const tarea: Tarea = {
                    IdTarea: this.newId(),
                    IdMaterial: material.IdMaterial,
                    Accion: 'Recoger',
                    IdTransaccion: idTransaccion,
                    IdEstado: Estado.Inactivo,
                    EntradaSalida: EntradaSalida.Salida,
                    Material: material.Nombre,
                  };
                  tareas.push(tarea);
                }
              }
            });
          }
        }
      }
      if (actividad.IdProceso === TipoProceso.Transporte) {
        var transaccion = actividad.Transacciones.find(x => x.IdTransaccion == idTransaccion);

        if (transaccion && (transaccion.EntradaSalida == 'S' || transaccion.EntradaSalida == 'T')){
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
              if (material.Medicion == TipoMedicion.Cantidad)
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
                  EntradaSalida: EntradaSalida.Salida,
                  Cantidades: cantidades,
                  Cantidad: residuo.Cantidad,
                  Peso: residuo.Peso,
                  Volumen: residuo.Volumen,
                  Material: material.Nombre,
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
      transaccion.Accion = this.getAccionEntradaSalida(transaccion.EntradaSalida ?? '');
      transaccion.Cantidad = cantidad;
      transaccion.Peso = peso;
      transaccion.Volumen = volumen;
      transaccion.ItemsAprobados = aprobados;
      transaccion.ItemsPendientes = pendientes;
      transaccion.ItemsRechazados = rechazados;
      transaccion.Cantidades = resumen;
      transaccion.Titulo = `${transaccion.Tercero} ${transaccion.Punto ?? ''}`;
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
    const tareaStorage: Actividad = actividades.find((item) => item.IdActividad == actividad.IdActividad)!;
    if (tareaStorage)
    {
        tareaStorage.IdEstado = actividad.IdEstado;
    }
    await this.storage.set("Actividades", actividades);
  }

  async updateTransaccion(idActividad: string, transaccion: Transaccion) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad)
    {
      const transaccionActual: Transaccion | undefined = actividad.Transacciones.find((trx) => trx.IdTransaccion == trx.IdTransaccion);
      if (transaccionActual) {
        transaccionActual.IdEstado = transaccion.IdEstado;
      }
    }
    await this.storage.set("Actividades", actividades);
  }

  async updateTarea(idActividad: string, idTransaccion: string, tarea: Tarea) {
    let tareaUpdate: Tarea | undefined = undefined;
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad)
    {
      tareaUpdate = actividad.Tareas.find((t) => t.IdTransaccion == idTransaccion && t.IdMaterial == tarea.IdMaterial);
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
      }
    }
    await this.storage.set("Actividades", actividades);
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
