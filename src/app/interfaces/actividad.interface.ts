import { Consumo } from "./consumo.interface";
import { Punto } from "./punto.interface";

export interface Actividad{
  IdActividad: string;

  CantidadCombustibleInicial?: number | null;
  CantidadCombustibleFinal?: number | null;
  Consumos?: Consumo[];
  Destino?: Punto;
  FechaFinal?: string | null;
  FechaInicial?: string | null;
  FechaOrden: string | null;
  IdEstado: string;
  IdOrden?: string | null;
  IdRecurso: string;
  IdServicio: string;
  KilometrajeFinal?: number | null;
  KilometrajeInicial?: number | null;
  LatitudFinal?: number | null,
  LatitudInicial?: number | null,
  LongitudFinal?: number | null,
  LongitudInicial?: number | null,
  NavegarPorTransaccion: boolean;
  Orden?: string | null;
  Origen?: Punto;
  ResponsableCargo?: string;
  ResponsableFirma?: string | null;
  ResponsableIdentificacion?: string;
  ResponsableNombre?: string;
  ResponsableObservaciones?: string;
  Soporte?: string;
  Titulo: string;

  Accion?: string;
  Cantidades?: string;
  CRUD?: string | null;
  Icono?: string;
  ItemsAprobados?: number;
  ItemsPendientes?: number;
  ItemsRechazados?: number;
}
