export interface Transaccion {
  IdTransaccion: string;

  CRUD?: string;
  EntradaSalida?: string;
  Fecha?: string;
  Firma?: string;
  IdEstado: string;
  IdPunto?: string;
  IdTercero?: string;
  Kilometraje?: number;
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
