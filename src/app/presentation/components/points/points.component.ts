import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Punto } from '@app/domain/entities/punto.entity';
import { Tercero } from '@app/domain/entities/tercero.entity';
import { THIRD_PARTY_TYPES, CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { PointsService } from '@app/infrastructure/repositories/masterdata/points.repository';
import { ThirdpartiesService } from '@app/infrastructure/repositories/masterdata/thirdparties.repository';
import { Utils } from '@app/core/utils';
import { AuthorizationService } from '@app/infrastructure/repositories/masterdata/authorization.repository';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss'],
})
export class PointsComponent  implements OnInit, OnChanges {
  @Input() showHeader: boolean = true;
  @Input() idTercero: string = '';
  @Input() tipoTercero: string = '';
  @Input() includeMe: boolean = false;
  idPunto: string = '';
  puntos: Punto[] = [];
  filteredPuntos: Punto[] = [];
  terceros: Tercero[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  selectedOwner: string = '';
  enableNew: boolean = false;

  constructor(
    private pointsService: PointsService,
    private thirdpartiesService: ThirdpartiesService,
    private modalCtrl: ModalController,
    private authorizationService: AuthorizationService
  ) { }

  async ngOnInit() {
    await this.filterPoints();
    this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_POINT))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['idTercero']) {
      await this.filterPoints();
    }
  }

  async filterPoints() {
    const terceros = await this.thirdpartiesService.list();
    if (this.idTercero) {
      this.terceros = terceros.filter((x: Tercero) => x.IdPersona == this.idTercero);
    } else if (this.tipoTercero) {
      if (this.tipoTercero == THIRD_PARTY_TYPES.CLIENT)
        this.terceros = terceros.filter((x: Tercero) => x.Cliente);
      else if (this.tipoTercero == THIRD_PARTY_TYPES.SUPPLIER)
        this.terceros = terceros.filter((x: Tercero) => x.Proveedor);
      if (this.tipoTercero == THIRD_PARTY_TYPES.INTERNAL)
        this.terceros = terceros.filter((x: Tercero) => x.Empleado);
    } else {
      this.terceros = terceros;
    }

    const puntos =  await this.pointsService.list();
    if (this.idTercero)
      this.puntos = puntos.filter((x: Punto) => x.IdPersona == this.idTercero);
    else
      this.puntos = puntos;
    this.filteredPuntos = this.puntos;
  }

  filterPuntos(idTercero: string) {
    return this.filteredPuntos.filter((x: Punto) => x.IdPersona == idTercero);
  }

  async handleInput(event: any){
    let puntos: Punto[] = [];
    let tercero: string = '';
    let nombre: string = '';

    const query = event.target.value.toLowerCase();
    nombre = query.trim();
    puntos = this.puntos;
    if (nombre != '')
      puntos = puntos.filter((punto: Punto ) => punto.Nombre.toLowerCase().indexOf(nombre) > -1);
    this.filteredPuntos = puntos;
  }

  async select(idPunto: string, idTercero: string, tercero: string, nombre: string) {
    const idPersona = await this.authorizationService.getPersonId();

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
