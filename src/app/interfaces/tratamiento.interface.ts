export interface Tratamiento {
  IdTratamiento: string;

  Descripcion?: string;
  IdServicio: string;
  Nombre: string;
  Valor?: number;
  CRUD?: string | null;
  CRUDDate?: Date | null;
}
