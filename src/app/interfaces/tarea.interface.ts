import { Photo } from "@capacitor/camera";

export interface Tarea{
  IdTarea: string;

  Cantidad?: number;
  CantidadEmbalaje?: number;
  CRUD?: string | null;
  CRUDDate?: Date | null;
  EntradaSalida: string;
  FechaDocumento?: string;
  FechaEjecucion?: string;
  FechaSistema: string;
  FechaProgramada?: string;
  IdEmbalaje?: string;
  IdEstado: string;
  Item?: number;
  IdMaterial: string;
  IdDeposito?: string;
  IdDepositoDestino?: string;
  IdRecurso: string;
  IdResiduo?: string;
  IdServicio: string;
  IdDocumento?: string;
  IdTercero?: string;
  IdTerceroDestino?: string;
  IdTransaccion?: string;
  IdTratamiento?: string;
  Imagen?: string | null;
  Observaciones?: string;
  Peso?: number | null;
  Valor?: number;
  Volumen?: number;
  Fotos: Photo[];

  Accion?: string;
  Cantidades?: string;
  Embalaje?: string;
  Material?: string;
  Solicitud?: string;
  Tratamiento?: string;
}
