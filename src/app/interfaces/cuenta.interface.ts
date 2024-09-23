export interface Cuenta {
  IdCuenta: string;

  IdPersonaCuenta: string;
  IdPersonaUsuario: string;
  IdUsuario: string;
  LoginUsuario: string;
  NombreCuenta: string;
  NombreUsuario: string;

  Permisos: Record<string,string>;
  Parametros: Record<string,string>;
}
