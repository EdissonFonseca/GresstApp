export interface Material{
  IdMaterial: string;

  Aprovechable: boolean;
  Captura: string;
  IdEmbalaje?: string;
  IdTratamientos?: string[];
  Medicion: string;
  Nombre: string;
  Factor?: number;
  PesoUnitario?: number;
  PrecioUnitario?: number;
  PrecioCompra?: number;
  PrecioServicio?: number;
  CRUD?: string;
  CRUDDate?: Date;
}
