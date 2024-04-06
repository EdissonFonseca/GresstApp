export interface Tarea{
  IdTarea: string;

  Cantidad?: number;
  CantidadEmbalaje?: number;
  CRUD?: string;
  EntradaSalida?: string;
  FechaEjecucion?: string;
  FechaIngreso?: string;
  FechaProgramada?: string;
  IdEmbalaje?: string;
  IdEstado: string;
  IdItem?: number;
  IdMaterial: string;
  IdPunto?: string;
  IdServicio?: string;
  IdResiduo?: string;
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
