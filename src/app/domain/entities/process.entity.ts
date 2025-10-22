import { Subprocess } from "./subprocess.entity";
import { Task } from "./task.entity";

export interface Process{
  ProcessId: string;

  AutomaticClose?: boolean | null;

  EndDate?: string | null;
  ProcessDate: string | null;
  StartDate?: string | null;
  StatusId: string;
  OrderId?: string | null;
  ResourceId: string;
  ServiceId: string;
  FinalLatitude?: number | null,
  FinalLongitude?: number | null,
  OriginFacilityId?: string;
  DestinationFacilityId?: string;
  ResponsiblePosition?: string;
  ResponsibleSignature?: string | null;
  ResponsibleIdentification?: string;
  ResponsibleName?: string;
  ResponsibleNotes?: string;
  Support?: string;
  Title: string;
  Description?: string;

  // Those arrays are used just for receive from api but not used in the domain
  Subprocesses?: Subprocess[];
  Tasks?: Task[];
}
