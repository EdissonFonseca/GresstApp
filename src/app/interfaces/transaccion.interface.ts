export interface Transaccion {
  IdTransaccion: string;

  CargoPersonaEntrega?: string;
  CRUD?: string;
  CRUDDate?: Date;
  FechaEjecucion?: string;
  FechaProgramada?: string;
  Firma?: Blob;
  IdEstado: string;
  IdPunto?: string;
  IdTercero?: string;
  IdRecurso: string;
  IdServicio: string;
  Kilometraje?: number;
  NombrePersonaEntrega?: string;
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
