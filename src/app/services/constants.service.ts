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

export enum TipoMedicion{
  Cantidad = "C",
  Peso = "P",
  Volumen = "V"
}

export enum TipoProceso {
  Almacenamiento = "A",
  Disposicion = "D",
  Entrada = "E",
  Generacion = "G",
  Inventario = "I",
  Recoleccion = "L",
  Salida = "S",
  Transporte = "T",
  Transformacion = "M",
  Traslado = "R",
  Perdida = "P"
};

export enum TipoServicio {
  Almacenamiento = 1,
  Disposicion,
  Pretratamiento,
  Recepcion,
  Transferencia,
  Tratamiento,
  TrasladoTransporte,
  RecoleccionTransporte,
  Ajuste,
  Conciliacion,
  Generacion,
  Traslado,
  TransferenciaTransporte,
  Recoleccion,
  Perdida
}

export enum TipoObjeto {
  Material = "M",
  Punto = "P",
};
