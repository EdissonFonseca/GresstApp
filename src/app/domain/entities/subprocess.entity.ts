import { Task } from "./task.entity";

export interface Subprocess {
  ProcessId: string;
  SubprocessId: string;

  FuelQuantity?: number | null;
  FuelCost?: number | null;
  InputOutput: string;
  EndDate?: string;
  StartDate?: string;
  FacilityId?: string;
  DestinationFacilityId?: string;
  StatusId: string;
  OrderId?: string | null;
  ResourceId: string;
  ServiceId: string;
  PartyId?: string;
  DestinationPartyId?: string;
  Mileage?: number;
  Latitude?: number | null;
  Longitude?: number | null;
  FacilityName?: string;
  ResponsiblePosition?: string;
  ResponsibleSignature?: string | null;
  ResponsibleIdentification?: string;
  ResponsibleName?: string;
  ResponsibleNotes?: string;
  Requests?: string;
  PartyName?: string;
  Title: string;
  LocationName?: string;

  Action?: string;
  Icon?: string;

  // Additional fields
  MaterialId?: string;
  Material?: string;
  Quantity?: number;
  Weight?: number;
  Volume?: number;
  PackagingId?: string;
  Packaging?: string;
  TreatmentId?: string;
  Treatment?: string;
  Photos?: string[];
  Notes?: string;

  // Form fields
  RequestDate?: string;
  ScheduledDate?: string;
  ExecutionDate?: string;
  PackagingQuantity?: number;
  Photo?: string;
  Price?: number;
  InputPointId?: string;
  InputPoint?: string;
  OutputPointId?: string;
  OutputPoint?: string;
  InputThirdPartyId?: string;
  InputThirdParty?: string;
  OutputThirdPartyId?: string;
  OutputThirdParty?: string;
  ResidueId?: string;
  Residue?: string;
  Capture?: string;
  Measurement?: string;
  Factor?: number;

  // Those arrays are used just for receive from api but not used in the domain
  Tasks: Task[];
}
