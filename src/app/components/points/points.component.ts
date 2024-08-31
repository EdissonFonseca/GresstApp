import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { Tercero } from 'src/app/interfaces/tercero.interface';
import { ClienteProveedorInterno, CRUDOperacion, Permisos } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { MasterDataService } from 'src/app/services/masterdata.service';

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
    private globales: Globales,
    private masterDataService: MasterDataService,
    private modalCtrl: ModalController,
  ) { }

  async ngOnInit() {
    await this.filterPoints();
    this.enableNew = (await this.globales.getPermiso(Permisos.AppPunto))?.includes(CRUDOperacion.Create);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['idTercero']) {
      await this.filterPoints();
    }
  }

  async filterPoints() {
    const terceros = await this.masterDataService.getTerceros();
    if (this.idTercero) {
      this.terceros = terceros.filter(x => x.IdTercero == this.idTercero);
    } else if (this.tipoTercero) {
      if (this.includeMe)
        this.terceros = terceros.filter(x => x.ClienteProveedorInterno == this.tipoTercero || x.ClienteProveedorInterno == ClienteProveedorInterno.Interno);
      else
        this.terceros = terceros.filter(x => x.ClienteProveedorInterno == this.tipoTercero);
    } else {
      this.terceros = terceros;
    }

    const puntos =  await this.masterDataService.getPuntos();
    if (this.idTercero)
      this.puntos = puntos.filter(x => x.IdTercero == this.idTercero);
    else
      this.puntos = puntos;
    this.filteredPuntos = this.puntos;
  }

  filterPuntos(idTercero: string) {
    return this.filteredPuntos.filter(x => x.IdTercero == idTercero);
  }

  async handleInput(event: any){
    let puntos: Punto[] = [];
    let tercero: string = '';
    let nombre: string = '';

    const query = event.target.value.toLowerCase();
    nombre = query.trim();
    puntos = this.puntos;
    if (nombre != '')
      puntos = puntos.filter((punto) => punto.Nombre.toLowerCase().indexOf(nombre) > -1);
    this.filteredPuntos = puntos;
  }

  async select(idPunto: string, idTercero: string, tercero: string, nombre: string) {
    const idPersona = await this.globales.getIdPersona();

    this.selectedValue = idPunto;
    if (idPersona == idTercero)
      this.selectedName = `${nombre}`;
    else
      this.selectedName = `${tercero} - ${nombre}`;
    this.selectedOwner = idTercero;
    const data = {id: this.selectedValue, name: this.selectedName, owner: this.selectedOwner};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

}
