import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Waste } from '@app/domain/entities/waste.entity';
import { InventoryRepository } from '@app/infrastructure/repositories/inventory.repository';

@Component({
  selector: 'app-wastes',
  templateUrl: './wastes.component.html',
  styleUrls: ['./wastes.component.scss'],
  standalone: false
})
export class WastesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  residues : Waste[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string ='';

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private inventoryRepository: InventoryRepository,
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
    });
    this.residues = await this.inventoryRepository.list();
  }

  async getNombre(idResiduo: string) {
    let nombre: string = '';
    console.log(idResiduo);
    const residuo = await this.inventoryRepository.getResidue(idResiduo);


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

    const inventory = await this.inventoryRepository.list();
    this.residues = inventory.filter((waste) => waste.MaterialName??''.toLowerCase().indexOf(query) > -1);
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

