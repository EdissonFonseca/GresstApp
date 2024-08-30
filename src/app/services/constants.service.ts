export enum ClienteProveedorInterno {
  Cliente = "C",
  Proveedor = "P",
  Interno = "I"
}
export enum CRUDOperacion {
  Create = 'C',
  Update = 'U',
  Delete = 'D',
  Read = 'R'
}
export enum EntradaSalida {
  Entrada = "E",
  Salida = "S",
  Transferencia = "T",
  Ninguno = "N"
}
export enum Estado{
  Activo = "A",
  Aprobado = "A",
  Finalizado = "F",
  Pendiente = "P",
  Rechazado = "R",
  Inactivo = "I"
};
export enum Permisos{
  App = "App",
  AppCertificado = "AppCertificado",
  AppConfiguracion = "AppConfiguracion",
  AppClaseTratamiento = "AppClaseTratamiento",
  AppCuenta = "AppCuenta",
  AppDeposito = "AppDeposito",
  AppEmbalaje = "AppEmbalaje",
  AppInsumo = "AppInsumo",
  AppMaterial = "AppMaterial",
  AppPunto = "AppPunto",
  AppServicio = "AppServicio",
  AppTercero = "AppTercero",
  AppVehiculo = "AppVehiculo",
  AppActividad = "AppActividad",
  AppAcopio = "AppAcopio",
  AppAgrupacion = "AppAgrupacion",
  AppAlmacenamiento = "AppAlmacenamiento",
  AppAprovechamiento = "AppAprovechamiento",
  AppDisposicion = "AppDisposicion",
  AppEntrega = "AppEntrega",
  AppGeneracion = "AppGeneracion",
  AppPerdida = "AppPerdida",
  AppRecepcion = "AppRecepcion",
  AppRecoleccion = "AppRecoleccion",
  AppTransformacion = "AppTransformacion",
  AppTransporte = "AppTransporte",
  AppTratamiento = "AppTratamiento",
  AppVenta = "AppVenta",
  AppBanco = "AppBanco",
  AppInventario = "AppInventario",
  AppEntrada = "AppEntrada",
  AppPublicacion = "AppPublicacion",
  AppSalida = "AppSalida",
  AppTraslado = "AppTraslado",
  AppTransferencia = "AppTransferencia",
  AppTransform = "AppTransform",
}
export enum TipoMedicion{
  Cantidad = "C",
  Peso = "P",
  Volumen = "V"
}
export enum TipoServicio {
  Almacenamiento = "1",
  Disposicion = "2",
  Pretratamiento = "3",
  Recepcion = "4",
  Aprovechamiento = "5",
  Tratamiento = "6",
  Transferencia = "7",
  Transporte = "8",
  Ajuste = "9",
  Conciliacion = "10",
  Generacion = "11",
  Acopio = "12",
  Recoleccion = "13",
  Entrega = "14",
  Perdida = "15",
  Traslado = "16"
}

export enum TipoObjeto {
  Material = "M",
  Punto = "P",
};
