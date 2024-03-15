import { Costo } from "./costo.interface";
import { Insumo } from "./insumo.interface";
import { Tarea } from "./tarea.interface";
import { Transaccion } from "./transaccion.interface";

export interface Actividad{
  IdActividad: string;

  CRUD?: string;
  Costos?: Costo[];
  FechaFin?: Date;
  FechaFinLimite?: Date;
  FechaInicio?: Date;
  FechaInicioLimite?: Date;
  Firma?: string;
  IdEstado: string;
  IdProceso: string;
  IdRecurso: string;
  Insumos?: Insumo[];
  NavegarPorTransaccion: boolean;
  Observaciones?: string;
  Soporte?: string;
  Tareas: Tarea[];
  Titulo: string;
  Transacciones: Transaccion[];

  Accion?: string;
  Icono?: string;
  ItemsAprobados?: number;
  ItemsPendientes?: number;
  ItemsRechazados?: number;
  Cantidades?: string;
}
