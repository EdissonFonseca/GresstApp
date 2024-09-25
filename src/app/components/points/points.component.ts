import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { Tercero } from 'src/app/interfaces/tercero.interface';
import { ClienteProveedorInterno, CRUDOperacion, Permisos } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { PuntosService } from 'src/app/services/puntos.service';
import { TercerosService } from 'src/app/services/terceros.service';

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
    private puntosService: PuntosService,
    private tercerosService: TercerosService,
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
    const terceros = await this.tercerosService.list();
    if (this.idTercero) {
      this.terceros = terceros.filter(x => x.IdPersona == this.idTercero);
    } else if (this.tipoTercero) {
      if (this.tipoTercero == ClienteProveedorInterno.Cliente)
        this.terceros = terceros.filter(x => x.Cliente);
      else if (this.tipoTercero == ClienteProveedorInterno.Proveedor)
        this.terceros = terceros.filter(x => x.Proveedor);
      if (this.tipoTercero == ClienteProveedorInterno.Interno)
        this.terceros = terceros.filter(x => x.Empleado);
    } else {
      this.terceros = terceros;
    }

    const puntos =  await this.puntosService.list();
    if (this.idTercero)
      this.puntos = puntos.filter(x => x.IdPersona == this.idTercero);
    else
      this.puntos = puntos;
    this.filteredPuntos = this.puntos;
  }

  filterPuntos(idTercero: string) {
    return this.filteredPuntos.filter(x => x.IdPersona == idTercero);
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
    const data = {id: this.selectedValue, name: this.selectedName, owner: this.selectedOwner, ownerName: tercero};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

}
