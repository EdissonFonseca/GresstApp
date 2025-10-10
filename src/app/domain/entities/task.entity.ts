import { Photo } from "@capacitor/camera";

export interface Task{
  ProcessId: string;
  SubprocessId?: string;
  TaskId: string;

  Quantity?: number;
  InputOutput: string;

  ExecutionDate?: string;
  RequestDate?: string;
  ScheduledDate?: string;

  Photos: string[];

  FacilityId?: string;
  DestinationFacilityId?: string;
  PackageId?: string;
  StatusId: string;
  MaterialId: string;
  ResourceId: string;
  WasteId?: string;
  ServiceId: string;
  RequestId?: number | null;
  PartyId?: string;
  DestinationPartyId?: string;
  TreatmentId?: string;
  Item?: number | null;
  Notes?: string;
  Weight?: number | null;
  RequestName?: string | null;
  Price?: number;
  Volume?: number;
}
