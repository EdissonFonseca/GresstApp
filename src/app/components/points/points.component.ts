import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { Tercero } from 'src/app/interfaces/tercero.interface';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss'],
})
export class PointsComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  @Input() idTercero: string = '';
  @Input() almacenamiento: boolean | null = null;
  @Input() disposicion: boolean | null = null;
  @Input() entrega: boolean | null = null;
  @Input() generacion: boolean | null = null;
  @Input() recepcion: boolean | null = null;
  @Input() tratamiento: boolean | null = null;
  idPunto: string = '';
  puntos: Punto[] = [];
  terceros: Tercero[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  selectedOwner: string = '';

  constructor(
    private route: ActivatedRoute,
    private globales: Globales,
    private modalCtrl: ModalController,
    private navParams: NavParams,
  ) { }

  async ngOnInit() {
    // this.almacenamiento = this.navParams.get("Almacenamiento");
    // this.disposicion = this.navParams.get("Disposicion");
    // this.entrega = this.navParams.get("Entrega");
    // this.generacion = this.navParams.get("Generacion");
    // this.recepcion = this.navParams.get("Recepcion");
    // this.tratamiento = this.navParams.get("Tratamiento");

    this.almacenamiento = this.navParams.get("Almacenamiento");
    this.disposicion = this.navParams.get("Disposicion");
    if (!this.idTercero)
    {
      this.terceros = (await this.globales.getTercerosConPuntos());
      this.idTercero = this.navParams.get("IdTercero");
      if (this.idTercero)
      {
        this.terceros = (await this.globales.getTerceros()).filter(x => x.IdTercero == this.idTercero);
        this.puntos = (await this.globales.getPuntos()).filter((punto) => punto.IdTercero == this.idTercero);
      }
      else
      {
        this.terceros = (await this.globales.getTercerosConPuntos());
        this.puntos = (await this.globales.getPuntos());
      }
    }
    else
    {
      this.terceros = (await this.globales.getTerceros()).filter(x => x.IdTercero == this.idTercero);
      this.puntos = (await this.globales.getPuntos()).filter((punto) => punto.IdTercero == this.idTercero);
    }
    if (this.almacenamiento) {
      this.puntos = this.puntos.filter(x => x.Almacenamiento);
    }
  }

  filterPuntos(idTercero: string) {
    return this.puntos.filter(x => x.IdTercero == idTercero);
  }

  async handleInput(event: any){
    let puntos: Punto[] = [];
    let tercero: string = '';
    let nombre: string = '';

    const query = event.target.value.toLowerCase();
    const parts: string[] = query.split('-');
    if (parts.length > 1)
    {
      tercero = parts[0].trim();
      nombre = parts[1].trim();
    }
    else
    {
      tercero = query.trim();
    }

    puntos = await this.globales.getPuntos();
    if (tercero != '')
    {
      puntos = puntos.filter((punto) => (punto.Tercero ?? '').toLowerCase().indexOf(tercero) > -1);
    }
    if (nombre != '')
    {
      puntos = puntos.filter((punto) => punto.Nombre.toLowerCase().indexOf(nombre) > -1);
    }
    this.puntos = puntos;
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
