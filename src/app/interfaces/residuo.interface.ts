export interface Residuo{
  IdResiduo: string;

  Aprovechable: boolean;
  CRUD?: string;
  IdDeposito?: string;
  IdDepositoOrigen?: string;
  IdEmbalaje?: string;
  IdEstado: string;
  IdMaterial: string;
  IdPropietario: string;
  IdRuta?: string;
  IdTratamiento?: string;
  IdVehiculo?: string;
  Cantidad?: number;
  CantidadEmbalaje?: number;
  EntradaSalida?: string;
  FechaIngreso?: string;
  Imagen?: string | null;
  NumeroContactos?: number;
  Peso?: number;
  Precio?: number;
  Publico?: boolean;
  Solicitud?: string;
  Ubicacion: string;
  Volumen?: number;

  Propietario?: string;
  Material?: string;
  DepositoOrigen?: string;
  Cantidades?: string;
}
