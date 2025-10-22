export interface Material{
  Id: string;

  Name: string;
  Type: string;
  IsRecyclable: boolean;
  Reference?: string;
  CaptureType: string;
  MeasurementType: string;
  Weight?: number;
  Volume?: number;
}
