import { Costo } from "./costo.interface";
import { Insumo } from "./insumo.interface";
import { Punto } from "./punto.interface";
import { Tarea } from "./tarea.interface";
import { Transaccion } from "./transaccion.interface";

export interface Actividad{
  IdActividad: string;

  CantidadCombustible?: number | null;
  CostoCombustible?: number | null;
  CRUD?: string | null;
  CRUDDate?: Date | null;
  Costos?: Costo[];
  Origen?: Punto;
  Destino?: Punto;
  FechaFin?: string | null;
  FechaInicio: string;
  IdOrden?: string | null;
  Orden?: string | null;
  IdResponsable?: string;
  IdEstado: string;
  IdServicio: string;
  IdRecurso: string;
  Insumos?: Insumo[];
  Kilometraje?: number | null;
  NavegarPorTransaccion: boolean;
  ResponsableCargo?: string;
  ResponsableFirma?: string | null;
  ResponsableIdentificacion?: string;
  ResponsableNombre?: string;
  ResponsableObservaciones?: string;
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
