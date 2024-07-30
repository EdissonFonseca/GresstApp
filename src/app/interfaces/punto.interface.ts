export interface Punto {
  IdPunto: string;

  Direccion?: string;
  IdMateriales: string[];
  IdTercero?: string;
  Latitud?: string;
  Longitud?: string;
  Localizacion?: string;
  Nombre: string;
  Tercero?: string;
  Tipo?: string;
  Acopio: boolean;
  Almacenamiento: boolean;
  Disposicion: boolean;
  Entrega: boolean;
  Generacion: boolean;
  Recepcion: boolean;
  Tratamiento: boolean;
  CRUD?: string;
  CRUDDate?: Date;
}

