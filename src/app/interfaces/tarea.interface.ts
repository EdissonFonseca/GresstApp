export interface Tarea{
  IdTarea: string;

  Cantidad?: number;
  CantidadEmbalaje?: number;
  CRUD?: string;
  CRUDDate?: Date;
  EntradaSalida: string;
  FechaEjecucion?: string;
  FechaIngreso: string;
  FechaProgramada?: string;
  IdEmbalaje?: string;
  IdEstado: string;
  Item?: number;
  IdMaterial: string;
  IdPunto?: string;
  IdRecurso: string;
  IdResiduo?: string;
  IdServicio: string;
  IdSolicitud?: string;
  IdSolicitante?: string;
  IdTransaccion?: string;
  IdTratamiento?: string;
  Imagen?: string | null;
  Observaciones?: string;
  Peso?: number | null;
  Valor?: number;
  Volumen?: number;

  Accion?: string;
  Cantidades?: string;
  Embalaje?: string;
  Material?: string;
  Solicitud?: string;
  Tratamiento?: string;
}
