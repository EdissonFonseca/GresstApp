import { Photo } from "@capacitor/camera";

export interface Tarea{
  IdActividad: string;
  IdTransaccion?: string;
  IdTarea: string;

  Cantidad?: number;
  EntradaSalida: string;
  FechaEjecucion?: string;
  FechaProgramada?: string;
  FechaSolicitud?: string;
  Fotos: string[];
  IdDeposito?: string;
  IdDepositoDestino?: string;
  IdEmbalaje?: string;
  IdEstado: string;
  IdMaterial: string;
  IdRecurso: string;
  IdResiduo?: string;
  IdServicio: string;
  IdSolicitud?: number | null;
  IdTercero?: string;
  IdTerceroDestino?: string;
  IdTratamiento?: string;
  Item?: number | null;
  Observaciones?: string;
  Peso?: number | null;
  Solicitud?: string | null;
  Valor?: number;
  Volumen?: number;

  Accion?: string;
  Cantidades?: string;
  CRUD?: string | null;
  Embalaje?: string;
  Imagen?: string | null;
  Material?: string;
  Tratamiento?: string;
}
