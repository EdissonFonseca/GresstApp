export interface Transaccion {
  IdActividad: string;
  IdTransaccion: string;

  CantidadCombustible?: number | null;
  CostoCombustible?: number | null;
  EntradaSalida: string;
  FechaFinal?: string;
  FechaInicial?: string;
  IdDeposito?: string;
  IdDepositoDestino?:string;
  IdEstado: string;
  IdOrden?: string | null;
  IdRecurso: string;
  IdServicio: string;
  IdTercero?: string;
  IdTerceroDestino?: string;
  Kilometraje?: number;
  Latitud?: number | null;
  Longitud?: number | null;
  Punto?: string;
  ResponsableCargo?: string;
  ResponsableFirma?: string | null;
  ResponsableIdentificacion?: string;
  ResponsableNombre?: string;
  ResponsableObservaciones?: string;
  Solicitudes?: string;
  Tercero?: string;
  Titulo: string;
  Ubicacion?: string;

  Accion?: string;
  CRUD?: string | null;
  Icono?: string;
}
