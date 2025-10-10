export interface Waste{
  Id: string;

  IsRecyclable: boolean;
  CRUD?: string;
  CRUDDate?: Date;
  FacilityId?: string;
  OriginFacilityId?: string;
  PackageId?: string;
  StatusId: string;
  MaterialId: string;
  OwnerId: string;
  RouteId?: string;
  TreatmentId?: string;
  VehicleId?: string;
  Quantity?: number;
  PackageQuantity?: number;
  InputOutput?: string;
  EntryDate?: string;
  Image?: string | null;
  Weight?: number;
  Price?: number;
  IsPublic?: boolean;
  RequestName?: string;
  LocationName: string;
  Volume?: number;

  OwnerName?: string;
  MaterialName?: string;
  OriginFacilityName?: string;
  QuantitiesName?: string;
}
