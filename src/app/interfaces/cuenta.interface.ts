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
  MostrarIntroduccion:  boolean;

  Embalajes: Embalaje[];
  Insumos: Insumo[];
  Materiales: Material[];
  Puntos: Punto[];
  Servicios: Servicio[];
  Terceros: Tercero[];
  Tratamientos: Tratamiento[];
  Vehiculos: Vehiculo[];

  PermisosActividadesCRUD: string;
  PermisosAlmacenamientoCRUD: string;
  PermisosCuentaCRUD: string;
  PermisosDisposicionCRUD: string;
  PermisosEmbalajesCRUD: string;
  PermisosInventarioCRUD: string;
  PermisosGeneracionCRUD: string;
  PermisosMaterialesCRUD: string;
  PermisosMermaCRUD: string;
  PermisosPretratamientoCRUD: string;
  PermisosPuntosCRUD: string;
  PermisosRecepcionCRUD: string;
  PermisosRecoleccionCRUD: string;
  PermisosRecoleccionTransporteCRUD: string;
  PermisosServiciosCRUD: string;
  PermisosTareasCRUD: string;
  PermisosTercerosCRUD: string;
  PermisosTransacionesCRUD: string;
  PermisosTransferenciaCRUD: string;
  PermisosTransferenciaTransporteCRUD: string;
  PermisosTrasladoCRUD: string;
  PermisosTrasladoTransporteCRUD: string;
  PermisosTratamientoCRUD: string;
  PermisosVehiculosCRUD: string;
}
