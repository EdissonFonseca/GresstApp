import { Photo } from "@capacitor/camera";

export interface Tarea{
  IdProceso: string;
  IdTransaccion?: string;
  IdTarea: string;

  Cantidad?: number;
  Deposito?: string;
  DepositoDestino?: string;
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
  Embalaje?: string;
  Material?: string;
  Tratamiento?: string;

  //Summary Properties
  pending?: number;
  approved?: number;
  rejected?: number;
  quantity?: number;
  weight?: number;
  volume?: number;
}
