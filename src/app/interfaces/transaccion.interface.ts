export interface Transaccion {
  IdActividad: string;
  IdTransaccion: string;

  CantidadCombustible?: number | null;
  CostoCombustible?: number | null;
  EntradaSalida: string;
  FechaFinal?: string;
  FechaInicial?: string;
  IdDeposito?: string;
  IdDepositoDestino?:string;
  IdEstado: string;
  IdOrden?: string | null;
  IdRecurso: string;
  IdServicio: string;
  IdTercero?: string;
  IdTerceroDestino?: string;
  Kilometraje?: number;
  Latitud?: number | null;
  Longitud?: number | null;
  Punto?: string;
  ResponsableCargo?: string;
  ResponsableFirma?: string | null;
  ResponsableIdentificacion?: string;
  ResponsableNombre?: string;
  ResponsableObservaciones?: string;
  Solicitudes?: string;
  Tercero?: string;
  Titulo: string;
  Ubicacion?: string;

  Accion?: string;
  Icono?: string;

  // Campos adicionales
  IdMaterial?: string;
  Material?: string;
  Cantidad?: number;
  Peso?: number;
  Volumen?: number;
  IdEmbalaje?: string;
  Embalaje?: string;
  IdTratamiento?: string;
  Tratamiento?: string;
  Fotos?: string[];
  Observaciones?: string;

  // Campos del formulario
  FechaSolicitud?: string;
  FechaProgramada?: string;
  FechaEjecucion?: string;
  PackagingQuantity?: number;
  Photo?: string;
  PackagingId?: string;
  Packaging?: string;
  Price?: number;
  InputPointId?: string;
  InputPoint?: string;
  OutputPointId?: string;
  OutputPoint?: string;
  InputThirdPartyId?: string;
  InputThirdParty?: string;
  OutputThirdPartyId?: string;
  OutputThirdParty?: string;
  Title?: string;
  TreatmentId?: string;
  ResidueId?: string;
  Residue?: string;
  Capture?: string;
  Measurement?: string;
  Factor?: number;

  //Summary Properties
  pending?: number;
  approved?: number;
  rejected?: number;
  quantity?: number;
  weight?: number;
  volume?: number;
}
