import { Facility } from "./facility.entity";
import { Subprocess } from "./subprocess.entity";
import { Task } from "./task.entity";

export interface Process{
  ProcessId: string;

  InitialFuelQuantity?: number | null;
  FinalFuelQuantity?: number | null;
  AutomaticClose?: boolean | null;

  Origin?: Facility;
  Destination?: Facility;

  EndDate?: string | null;
  StartDate?: string | null;
  ProcessDate: string | null;

  StatusId: string;
  OrderId?: string | null;
  ResourceId: string;
  ServiceId: string;
  FinalMileage?: number | null;
  InitialMileage?: number | null;
  FinalLatitude?: number | null,
  InitialLatitude?: number | null,
  FinalLongitude?: number | null,
  InitialLongitude?: number | null,
  OrderName?: string | null;
  ResponsiblePosition?: string;
  ResponsibleSignature?: string | null;
  ResponsibleIdentification?: string;
  ResponsibleName?: string;
  ResponsibleNotes?: string;
  Support?: string;
  Title: string;

  Action?: string;
  Icon?: string;

  // Those arrays are used just for receive from api but not used in the domain
  Subprocesses: Subprocess[];
  Tasks: Task[];
}
