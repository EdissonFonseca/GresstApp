export interface Material{
  Id: string;

  Name: string;
  Type: string;
  IsRecyclable: boolean;
  Reference?: string;
  EmissionCompensationFactor?: number;
  ServiceCost?: number;
  PurchaseCost?: number;
  MeasurementType: string;
}
