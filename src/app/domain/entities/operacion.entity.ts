import { Proceso } from "./proceso.entity";
import { Tarea } from "./tarea.entity";
import { Transaccion } from "./transaccion.entity";

export interface Operacion {
  Procesos: Proceso[];
  Tareas: Tarea[];
  Transacciones: Transaccion[];
}
