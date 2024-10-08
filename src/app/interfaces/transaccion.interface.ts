export interface Transaccion {
  IdActividad: string;
  IdTransaccion: string;

  CantidadCombustible?: number | null;
  CostoCombustible?: number | null;
  CRUD?: string | null;
  EntradaSalida: string;
  FechaInicial?: string;
  FechaFinal?: string;
  IdOrden?: string | null;
  IdEstado: string;
  IdDeposito?: string;
  IdTercero?: string;
  IdTerceroDestino?: string;
  IdDepositoDestino?:string;
  IdRecurso: string;
  IdServicio: string;
  Kilometraje?: number;
  Latitud?: number;
  Longitud?: number;
  ResponsableCargo?: string;
  ResponsableFirma?: string | null;
  ResponsableIdentificacion?: string;
  ResponsableNombre?: string;
  ResponsableObservaciones?: string;
  Observaciones?: string;
  Punto?: string;
  Solicitudes?: string;
  Tercero?: string;
  Ubicacion?: string;

  Accion?: string;
  Cantidad?: number;
  Peso?: number;
  Volumen?: number;
  Cantidades?: string;
  Icono?: string;
  ItemsAprobados?: number;
  ItemsPendientes?: number;
  ItemsRechazados?: number;
  Titulo: string;
}
