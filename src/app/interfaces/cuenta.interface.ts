export interface Cuenta {
  IdCuenta: string;

  CorreoUsuario: string;
  Identificacion: string;
  IdPersona: string;
  Nombre: string;
  NombreUsuario: string;
  UnidadCantidad: string;
  UnidadPeso: string;
  UnidadVolumen: string;
  MostrarIntroduccion:  boolean;

  Permisos:  {[key: string]: string | null;};
}
