import { Injectable, signal, computed, Signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { Facility } from '@app/domain/entities/facility.entity';
import { STORAGE, STATUS } from '@app/core/constants';
import { TaskService } from '@app/application/services/task.service';

@Injectable({
  providedIn: 'root',
})
export class FacilityRepository {

  constructor(
    private storage: StorageService,
    private taskService: TaskService,
  ) {
  }

  async get(facilityId: string): Promise<Facility | undefined> {
    if (!facilityId) {
      return undefined;
    }
    const facilities = await this.storage.get(STORAGE.FACILITIES) as Facility[];
    return facilities.find(x => x.Id === facilityId);
  }

  async getAll(): Promise<Facility[]> {
    const facilities = await this.storage.get(STORAGE.FACILITIES) as Facility[];
    return facilities;
  }

  /**
   * Get points (facilities) from pending tasks for a given process
   * @param processId - The process ID to filter tasks by
   * @returns Signal<Facility[]> A signal containing the facilities from pending tasks
   */
  async getPointsFromPendingTasks$(processId: string): Promise<Signal<Facility[]>> {
    // Get all tasks for the process
    const tasks = await this.taskService.listByProcess(processId);

    // Filter only pending tasks
    const pendingTasks = tasks.filter(task => task.StatusId === STATUS.PENDING);

    // Extract unique facility IDs from both FacilityId and DestinationFacilityId
    const facilityIds = new Set<string>();
    pendingTasks.forEach(task => {
      if (task.FacilityId) {
        facilityIds.add(task.FacilityId);
      }
      if (task.DestinationFacilityId) {
        facilityIds.add(task.DestinationFacilityId);
      }
    });

    // Get all facilities
    const allFacilities = await this.getAll();

    // Filter facilities that are in the pending tasks
    const relevantFacilities = allFacilities.filter(facility =>
      facilityIds.has(facility.Id)
    );

    // Return as a signal
    return signal(relevantFacilities);
  }

}
