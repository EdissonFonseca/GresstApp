export interface Tratamiento {
  IdTratamiento: string;

  Descripcion?: string;
  IdServicio: string;
  Nombre: string;
  CRUD?: string | null;
  CRUDDate?: Date | null;
}
