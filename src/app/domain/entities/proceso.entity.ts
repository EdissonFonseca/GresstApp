import { Punto } from "./punto.entity";

export interface Proceso{
  IdProceso: string;

  CantidadCombustibleInicial?: number | null;
  CantidadCombustibleFinal?: number | null;
  CierreAutomatico?: boolean | null;

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
  Icono?: string;

  // Additional properties
  requestPoint?: boolean;
  requestOwner?: boolean;
  requestPackaging?: boolean;
  requestTreatment?: boolean;
  title?: string;

  //Summary Properties
  pending?: number;
  approved?: number;
  rejected?: number;
  quantity?: number;
  weight?: number;
  volume?: number;
}
