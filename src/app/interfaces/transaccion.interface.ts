export interface Transaccion {
  IdTransaccion: string;

  CRUD?: string | null;
  CRUDDate?: Date | null;
  EntradaSalida: string;
  FechaEjecucion?: string;
  FechaProgramada?: string;
  Firma?: Blob | null;
  FirmaUrl?: string | null;
  IdEstado: string;
  IdDeposito?: string;
  IdTercero?: string;
  IdRecurso: string;
  IdServicio: string;
  IdentificacionResponsable?: string;
  Kilometraje?: number;
  NombreResponsable?: string;
  NumeroTransaccion?: string;
  Observaciones?: string;
  Punto?: string;
  Soporte?: string;
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
