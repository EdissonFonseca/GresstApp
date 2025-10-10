import { Process } from "./process.entity";
import { Task } from "./task.entity";
import { Subprocess } from "./subprocess.entity";

export interface Operation {
  Processes: Process[];
  Subprocesses: Subprocess[];
  Tasks: Task[];
}
