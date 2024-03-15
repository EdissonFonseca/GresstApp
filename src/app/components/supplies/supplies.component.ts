import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Insumo } from 'src/app/interfaces/insumo.interface';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-supplies',
  templateUrl: './supplies.component.html',
  styleUrls: ['./supplies.component.scss'],
})
export class SuppliesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  supplies : Insumo[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';

  constructor(
    private route: ActivatedRoute,
    private globales: Globales,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    this.supplies = await this.globales.getInsumos();
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const insumos = await this.globales.getInsumos();
    this.supplies = insumos.filter((supply) => supply.Nombre .toLowerCase().indexOf(query) > -1);
  }

  select(idMaterial: string) {
    this.selectedValue = idMaterial;
    this.modalCtrl.dismiss(this.selectedValue, 'confirm');
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async create() {
    const id : string = await this.globales.createInsumo(this.selectedName);
    const data = {id: id, name: this.selectedName};
    if (this.showHeader){
      this.modalCtrl.dismiss(data);
    }
    else{
      this.selectedValue = id;
      this.searchText = '';
      this.supplies = await this.globales.getInsumos();
      const toast = await this.toastCtrl.create({
        message: `Insumo ${this.selectedName} creado`,
        duration: 1500,
        position: 'top',
      });

      await toast.present();
    }
  }
}
