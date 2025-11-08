import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Facility } from '@app/domain/entities/facility.entity';
import { Party } from '@app/domain/entities/party.entity';
import { THIRD_PARTY_TYPES, CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { FacilityRepository } from '@app/infrastructure/repositories/facility.repository';
import { PartyRepository } from '@app/infrastructure/repositories/party.repository';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.scss'],
  standalone: false
})
export class FacilitiesComponent  implements OnInit, OnChanges {
  @Input() showHeader: boolean = true;
  @Input() partyId: string = '';
  @Input() partyType: string = '';
  @Input() includeMe: boolean = false;
  facilities: Facility[] = [];
  filteredFacilities: Facility[] = [];
  parties: Party[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  selectedOwner: string = '';
  enableNew: boolean = false;

  constructor(
    private facilityRepository: FacilityRepository,
    private partyRepository: PartyRepository,
    private modalCtrl: ModalController,
    private authorizationRepository: AuthorizationRepository
  ) { }

  async ngOnInit() {
    await this.filterFacilities();
    this.enableNew = (await this.authorizationRepository.getPermission(PERMISSIONS.APP_FACILITY))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['partyId']) {
      await this.filterFacilities();
    }
  }

  async filterFacilities() {
    const parties = await this.partyRepository.getAll();
    if (this.partyId) {
      this.parties = parties.filter((x: Party) => x.Id == this.partyId);
    } else if (this.partyType) {
      if (this.partyType == THIRD_PARTY_TYPES.CLIENT)
        this.parties = parties.filter((x: Party) => x.IsClient);
      else if (this.partyType == THIRD_PARTY_TYPES.SUPPLIER)
        this.parties = parties.filter((x: Party) => x.IsProvider);
      if (this.partyType == THIRD_PARTY_TYPES.INTERNAL)
        this.parties = parties.filter((x: Party) => x.IsEmployee);
    } else {
      this.parties = parties;
    }

    // Sort parties by name
    this.parties = this.parties.sort((a, b) => a.Name.localeCompare(b.Name));

    const facilities =  await this.facilityRepository.getAll();

    // Log duplicates for debugging
    const facilityNames = facilities.map(f => f.Name);
    const duplicateNames = facilityNames.filter((name, index) => facilityNames.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
      console.log('Duplicate facility names found:', [...new Set(duplicateNames)]);
      duplicateNames.forEach(name => {
        const dups = facilities.filter(f => f.Name === name);
        console.log(`"${name}" appears ${dups.length} times with IDs:`, dups.map(d => ({ Id: d.Id, OwnerId: d.OwnerId })));
      });
    }

    // Remove duplicates by ID
    const uniqueFacilities = facilities.filter((facility, index, self) =>
      index === self.findIndex((f) => f.Id === facility.Id)
    );

    if (this.partyId)
      this.facilities = uniqueFacilities.filter((x: Facility) => x.OwnerId == this.partyId);
    else
      this.facilities = uniqueFacilities;

    // Sort facilities by party name (owner) and then by facility name
    this.facilities = this.facilities.sort((a, b) => {
      const partyA = this.parties.find(p => p.Id === a.OwnerId);
      const partyB = this.parties.find(p => p.Id === b.OwnerId);
      const partyNameA = partyA?.Name || '';
      const partyNameB = partyB?.Name || '';

      // First sort by party name
      const partyComparison = partyNameA.localeCompare(partyNameB);
      if (partyComparison !== 0) {
        return partyComparison;
      }

      // Then sort by facility name
      return a.Name.localeCompare(b.Name);
    });

    this.filteredFacilities = this.facilities;
  }

  getVisibleParties(): Party[] {
    // Get unique owner IDs from filtered facilities
    const ownerIds = new Set(this.filteredFacilities.map(f => f.OwnerId));
    // Return only parties that have facilities in the filtered list
    return this.parties.filter(p => ownerIds.has(p.Id));
  }

  filterFacilitiesByOwner(ownerId: string): Facility[] {
    return this.filteredFacilities.filter((x: Facility) => x.OwnerId == ownerId);
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase().trim();

    if (query === '') {
      // If search is empty, show all facilities
      this.filteredFacilities = this.facilities;
    } else {
      // Filter facilities by name
      this.filteredFacilities = this.facilities.filter((facility: Facility) =>
        facility.Name.toLowerCase().indexOf(query) > -1
      );
    }
  }

  async select(idPunto: string, idTercero: string, tercero: string, nombre: string) {
    const idPersona = await this.authorizationRepository.getPersonId();

    this.selectedValue = idPunto;
    if (idPersona == idTercero)
      this.selectedName = `${nombre}`;
    else
      this.selectedName = `${tercero} - ${nombre}`;
    this.selectedOwner = idTercero;
    const data = {id: this.selectedValue, name: this.selectedName, owner: this.selectedOwner, ownerName: tercero};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

}
