import { Actividad } from "./actividad.interface";
import { Tarea } from "./tarea.interface";
import { Transaccion } from "./transaccion.interface";

export interface Transaction {
  Actividades: Actividad[];
  Tareas: Tarea[];
  Transacciones: Transaccion[];
}
