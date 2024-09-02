export interface Tercero {
  IdPersona: string;
  Correo?: string;
  Identificacion: string;
  Cliente?: boolean | null;
  Proveedor?: boolean | null;
  Empleado?: boolean | null;
  Transportador?: boolean | null;
  Nombre: string;
  Telefono: string;
  CRUD?: string | null;
  CRUDDate?: Date | null;
}
