import { Embalaje } from "./embalaje.interface";
import { Insumo } from "./insumo.interface";
import { Material } from "./material.interface";
import { Punto } from "./punto.interface";
import { Servicio } from "./servicio.interface";
import { Tercero } from "./tercero.interface";
import { Tratamiento } from "./tratamiento.interface";
import { Vehiculo } from "./vehiculo.interface";

export interface MasterData {
  Embalajes: Embalaje[];
  Insumos: Insumo[];
  Materiales: Material[];
  Puntos: Punto[];
  Servicios: Servicio[];
  Terceros: Tercero[];
  Tratamientos: Tratamiento[];
  Vehiculos: Vehiculo[];
}
