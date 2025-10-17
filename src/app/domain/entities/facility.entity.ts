export interface Facility {
  Id: string;
  ParentId?: string;

  Address?: string;
  OwnerId: string;
  Latitude?: string;
  Longitude?: string;
  LocationId?: string;
  Name: string;
  IsDelivery: boolean;
  IsDisposal: boolean;
  IsHeadQuarter: boolean;
  IsStockPilling: boolean;
  IsStorage: boolean;
  IsGeneration: boolean;
  IsReception: boolean;
  IsTreatment: boolean;

  Facilities: Facility[];
}

