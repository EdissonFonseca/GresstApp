export interface Material{
  IdMaterial: string;

  Aprovechable: boolean;
  IdEmbalaje?: string;
  IdTratamientos?: string[];
  Nombre: string;
  Referencia?: string;
  Factor?: number;
  PrecioCompra?: number;
  PrecioServicio?: number;
  TipoCaptura: string;
  TipoMedicion: string;
  CRUD?: string | null;
  CRUDDate?: Date | null;
}
