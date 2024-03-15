import { CRUD } from "./CRUD.interface";
import { Embalaje } from "./embalaje.interface";
import { Insumo } from "./insumo.interface";
import { Material } from "./material.interface";
import { Punto } from "./punto.interface";
import { Servicio } from "./servicio.interface";
import { Tercero } from "./tercero.interface";
import { Tratamiento } from "./tratamiento.interface";
import { Vehiculo } from "./vehiculo.interface";

export interface Cuenta {
  IdCuenta: string;

  CorreoUsuario: string;
  Identificacion: string;
  Nombre: string;
  NombreUsuario: string;
  UnidadCantidad: string;
  UnidadPeso: string;
  UnidadVolumen: string;

  CuentaCRUD: CRUD;
  Embalajes: Embalaje[];
  EmbalajesCRUD: CRUD;
  Insumos: Insumo[];
  InsumosCRUD: CRUD;
  Materiales: Material[];
  MaterialesCRUD: CRUD;
  Puntos: Punto[];
  PuntosCRUD: CRUD;
  Servicios: Servicio[];
  Terceros: Tercero[];
  TercerosCRUD: CRUD;
  Tratamientos: Tratamiento[];
  Vehiculos: Vehiculo[];
  VehiculosCRUD: CRUD;
  AlmacenamientoCRUD: CRUD;
  DisposicionCRUD: CRUD;
  GeneracionCRUD: CRUD;
  MermaCRUD: CRUD;
  PretratamientoCRUD: CRUD;
  RecepcionCRUD: CRUD;
  RecoleccionCRUD: CRUD;
  RecoleccionTransporteCRUD: CRUD;
  TransferenciaCRUD: CRUD;
  TransferenciaTransporteCRUD: CRUD;
  TrasladoCRUD: CRUD;
  TrasladoTransporteCRUD: CRUD;
  TratamientoCRUD: CRUD;
}
