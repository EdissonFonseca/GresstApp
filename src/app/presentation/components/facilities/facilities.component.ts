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
})
export class FacilitiesComponent  implements OnInit, OnChanges {
  @Input() showHeader: boolean = true;
  @Input() idTercero: string = '';
  @Input() tipoTercero: string = '';
  @Input() includeMe: boolean = false;
  idPunto: string = '';
  puntos: Facility[] = [];
  filteredPuntos: Facility[] = [];
  terceros: Party[] = [];
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
    await this.filterPoints();
    this.enableNew = (await this.authorizationRepository.getPermission(PERMISSIONS.APP_POINT))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['idTercero']) {
      await this.filterPoints();
    }
  }

  async filterPoints() {
    const terceros = await this.partyRepository.getAll();
    if (this.idTercero) {
      this.terceros = terceros.filter((x: Party) => x.Id == this.idTercero);
    } else if (this.tipoTercero) {
      if (this.tipoTercero == THIRD_PARTY_TYPES.CLIENT)
        this.terceros = terceros.filter((x: Party) => x.IsClient);
      else if (this.tipoTercero == THIRD_PARTY_TYPES.SUPPLIER)
        this.terceros = terceros.filter((x: Party) => x.IsSupplier);
      if (this.tipoTercero == THIRD_PARTY_TYPES.INTERNAL)
        this.terceros = terceros.filter((x: Party) => x.IsEmployee);
    } else {
      this.terceros = terceros;
    }

    const puntos =  await this.facilityRepository.getAll();
    if (this.idTercero)
      this.puntos = puntos.filter((x: Facility) => x.OwnerId == this.idTercero);
    else
      this.puntos = puntos;
    this.filteredPuntos = this.puntos;
  }

  filterPuntos(idTercero: string) {
    return this.filteredPuntos.filter((x: Facility) => x.OwnerId == idTercero);
  }

  async handleInput(event: any){
    let puntos: Facility[] = [];
    let tercero: string = '';
    let nombre: string = '';

    const query = event.target.value.toLowerCase();
    nombre = query.trim();
    puntos = this.puntos;
    if (nombre != '')
      puntos = puntos.filter((punto: Facility ) => punto.Name.toLowerCase().indexOf(nombre) > -1);
    this.filteredPuntos = puntos;
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

