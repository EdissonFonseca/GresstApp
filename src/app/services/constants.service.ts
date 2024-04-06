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
