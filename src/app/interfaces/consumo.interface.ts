export interface Consumo{
  IdInsumo: string;
  FechaEjecucion: string;
  Descripcion?: string;
  Latitud: string | null;
  Longitud: string | null;
  Cantidad: number;
  Valor?: number | null;
}
