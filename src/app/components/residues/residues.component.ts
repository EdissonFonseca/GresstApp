import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { GlobalesService } from 'src/app/services/globales.service';
import { InventarioService } from 'src/app/services/inventario.service';

@Component({
  selector: 'app-residues',
  templateUrl: './residues.component.html',
  styleUrls: ['./residues.component.scss'],
})
export class ResiduesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  residues : Residuo[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string ='';

  constructor(
    private route: ActivatedRoute,
    private globales: GlobalesService,
    private modalCtrl: ModalController,
    private inventarioService: InventarioService,
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
    });
    this.residues = await this.inventarioService.list();
  }

  async getNombre(idResiduo: string) {
    let nombre: string = '';
    console.log(idResiduo);
    const residuo = await this.inventarioService.getResiduo(idResiduo);


    // if (residuo)
    // {
    //   nombre = `#${residuo.IdResiduo}`;
    //   const material = await this.globales.getMaterial(residuo.IdMaterial);
    //   if (material)
    //   {
    //     nombre = material.Nombre;

    //     const propietario = await this.globales.getTercero(residuo.IdPropietario);
    //     if (propietario)
    //     {
    //       nombre = nombre + "-" + propietario.Nombre;
    //     }
    //   }
    // }

    return nombre;
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const inventario = await this.inventarioService.list();
    this.residues = inventario.filter((residuo) => residuo.Material??''.toLowerCase().indexOf(query) > -1);
  }

  async select(idMaterial: string, nombre: string) {
    this.selectedValue = idMaterial;
    this.selectedName = nombre;
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async create() {
  }
}
