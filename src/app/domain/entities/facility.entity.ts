export interface Facility {
  Id: string;

  Address?: string;
  OwnerId: string;
  Latitude?: string;
  Longitude?: string;
  LocationId?: string;
  Name: string;
  Type: string;
  IsStockPilling: boolean;
  IsStorage: boolean;
  IsDisposal: boolean;
  IsDelivery: boolean;
  IsGeneration: boolean;
  IsReception: boolean;
  IsTreatment: boolean;

  Facilities: Facility[];
}

