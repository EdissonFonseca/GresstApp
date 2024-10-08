import { Photo } from "@capacitor/camera";

export interface Tarea{
  IdActividad: string;
  IdTransaccion?: string;
  IdTarea: string;

  Cantidad?: number;
  CRUD?: string | null;
  Solicitud?: string | null;
  EntradaSalida: string;
  FechaSolicitud?: string;
  FechaEjecucion?: string;
  FechaProgramada?: string;
  IdEmbalaje?: string;
  IdEstado: string;
  Item?: number | null;
  IdMaterial: string;
  IdDeposito?: string;
  IdDepositoDestino?: string;
  IdRecurso: string;
  IdResiduo?: string;
  IdServicio: string;
  IdSolicitud?: number | null;
  IdTercero?: string;
  IdTerceroDestino?: string;
  IdTratamiento?: string;
  Imagen?: string | null;
  Observaciones?: string;
  Peso?: number | null;
  Valor?: number;
  Volumen?: number;
  Fotos: string[];

  Accion?: string;
  Cantidades?: string;
  Embalaje?: string;
  Material?: string;
  Tratamiento?: string;
}
