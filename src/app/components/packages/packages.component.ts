import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Embalaje } from 'src/app/interfaces/embalaje.interface';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  packages : Embalaje[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string ='';

  constructor(
    private route: ActivatedRoute,
    private globales: Globales,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
    });
    this.packages = await this.globales.getEmbalajes();
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const embalajesList = await this.globales.getEmbalajes();
    this.packages = embalajesList.filter((embalaje) => embalaje.Nombre .toLowerCase().indexOf(query) > -1);
  }

  select(idMaterial: string, nombre: string) {
    this.selectedValue = idMaterial;
    this.selectedName = nombre;
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  confirm() {
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async create() {
    const id : string = await this.globales.createEmbalaje(this.selectedName);
    const data = {id: id, name: this.selectedName};
    if (this.showHeader){
      this.modalCtrl.dismiss(data);
    }
    else{
      this.selectedValue = id;
      this.searchText = '';
      this.packages = await this.globales.getEmbalajes();
      const toast = await this.toastCtrl.create({
        message: `Embalaje ${this.selectedName} creado`,
        duration: 1500,
        position: 'top',
      });

      await toast.present();
      const data = {id: this.selectedValue, name: this.selectedName};
      this.modalCtrl.dismiss(data);
    }
  }
}
