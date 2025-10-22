import { Task } from "./task.entity";

export interface Subprocess {
  ProcessId: string;
  SubprocessId: string;

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
  Latitude?: number | null;
  Longitude?: number | null;
  ResponsiblePosition?: string;
  ResponsibleSignature?: string | null;
  ResponsibleIdentification?: string;
  ResponsibleName?: string;
  ResponsibleNotes?: string;
  Title: string;
  Description?: string;

  // Those arrays are used just for receive from api but not used in the domain
  Tasks?: Task[];
}
