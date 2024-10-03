import { Costo } from "./costo.interface";
import { Insumo } from "./insumo.interface";
import { Punto } from "./punto.interface";
import { Tarea } from "./tarea.interface";
import { Transaccion } from "./transaccion.interface";

export interface Actividad{
  IdActividad: string;

  CantidadCombustibleInicial?: number | null;
  CantidadCombustibleFinal?: number | null;
  CRUD?: string | null;
  CRUDDate?: Date | null;
  Costos?: Costo[];
  Origen?: Punto;
  Destino?: Punto;
  FechaFinal?: string | null;
  FechaInicial?: string | null;
  IdOrden?: string | null;
  Orden?: string | null;
  IdResponsable?: string;
  IdEstado: string;
  IdServicio: string;
  IdRecurso: string;
  Insumos?: Insumo[];
  KilometrajeInicial?: number | null;
  KilometrajeFinal?: number | null;
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
  Cantidades?: string;
  Icono?: string;
  Iniciado?: boolean;
  ItemsAprobados?: number;
  ItemsPendientes?: number;
  ItemsRechazados?: number;
  PrimerIngreso?: boolean;
}
