import { Injectable, signal } from '@angular/core';
import { Tratamiento } from '@app/domain/entities/tratamiento.entity';
import { StorageService } from '@app/infrastructure/repositories/api/storage.repository';
import { STORAGE } from '@app/core/constants';

@Injectable({
  providedIn: 'root'
})
export class TreatmentsService {
  private treatments = signal<Tratamiento[]>([]);
  public treatments$ = this.treatments.asReadonly();

  constructor(private storage: StorageService) {
    this.loadTreatments();
  }

  private async loadTreatments() {
    const treatments = await this.storage.get(STORAGE.TREATMENTS);
    this.treatments.set(treatments || []);
  }

  private async saveTreatments() {
    const treatments = await this.storage.get(STORAGE.TREATMENTS);
    if (treatments) {
      treatments.Tratamientos = this.treatments();
      await this.storage.set(STORAGE.TREATMENTS, treatments);
    }
  }

  async get(id: string): Promise<Tratamiento | undefined> {
    return this.treatments().find(t => t.IdTratamiento === id);
  }

  async list(): Promise<Tratamiento[]> {
    return this.treatments();
  }

  async create(treatment: Tratamiento): Promise<void> {
    const currentTreatments = this.treatments();
    currentTreatments.push(treatment);
    this.treatments.set(currentTreatments);
    await this.saveTreatments();
  }

  async update(treatment: Tratamiento): Promise<void> {
    const currentTreatments = this.treatments();
    const index = currentTreatments.findIndex(t => t.IdTratamiento === treatment.IdTratamiento);
    if (index !== -1) {
      currentTreatments[index] = treatment;
      this.treatments.set(currentTreatments);
      await this.saveTreatments();
    }
  }

  async delete(id: string): Promise<void> {
    const currentTreatments = this.treatments();
    const filteredTreatments = currentTreatments.filter(t => t.IdTratamiento !== id);
    this.treatments.set(filteredTreatments);
    await this.saveTreatments();
  }
}
