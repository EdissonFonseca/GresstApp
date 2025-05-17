import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { Tercero } from 'src/app/interfaces/tercero.interface';
import { ClienteProveedorInterno, CRUDOperacion, Permisos } from '@app/constants/constants';
import { PointsService } from '@app/services/masterdata/points.service';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { Utils } from '@app/utils/utils';

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
  ) { }

  async ngOnInit() {
    await this.filterPoints();
    this.enableNew = (await Utils.getPermission(Permisos.AppPunto))?.includes(CRUDOperacion.Create);
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
      if (this.tipoTercero == ClienteProveedorInterno.Cliente)
        this.terceros = terceros.filter((x: Tercero) => x.Cliente);
      else if (this.tipoTercero == ClienteProveedorInterno.Proveedor)
        this.terceros = terceros.filter((x: Tercero) => x.Proveedor);
      if (this.tipoTercero == ClienteProveedorInterno.Interno)
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
    const idPersona = await Utils.getPersonId();

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
