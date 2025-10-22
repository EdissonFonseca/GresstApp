import { Photo } from "@capacitor/camera";

export interface Task{
  ProcessId: string;
  SubprocessId?: string;
  TaskId: string;

  InputOutput: string;
  ExecutionDate?: string;
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
  Item?: number | null;
  Notes?: string;
  Title: string;
  Description?: string;
  Quantity?: number;
  Volume?: number;
  Weight?: number | null;
}
