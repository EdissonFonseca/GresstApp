import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Tercero } from 'src/app/interfaces/tercero.interface';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-stakeholders',
  templateUrl: './stakeholders.component.html',
  styleUrls: ['./stakeholders.component.scss'],
})
export class StakeholdersComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  terceros: Tercero[] = [];
  formData: FormGroup;
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';

  constructor(
    private globales: Globales,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
  ) {
    this.formData = this.formBuilder.group({
      Identificacion: ['', Validators.required],
      Telefono: [''],
      Correo: [''],
    });
  }

  async ngOnInit() {
    this.terceros = await this.globales.getTerceros();
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const tercerosList = await this.globales.getTerceros();
    this.terceros = tercerosList.filter((tercero) => tercero.Nombre?.toLowerCase().indexOf(query) > -1);
  }

  select(idTercero: string, nombre: string) {
    this.selectedValue = idTercero;
    this.selectedName = nombre;
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async create() {
    if (this.formData.valid)
    {
      const formData = this.formData.value;
      const id : string = await this.globales.createTercero(this.selectedName, formData.Identificacion, formData.Telefono, formData.Correo);
      const data = {id: id, name: this.selectedName};
      if (this.showHeader){
        this.modalCtrl.dismiss(data);
      }
      else{
        this.selectedValue = id;
        this.searchText = '';
        this.terceros = await this.globales.getTerceros();
        const toast = await this.toastCtrl.create({
          message: `Tercero ${this.selectedName} creado`,
          duration: 1500,
          position: 'top',
        });

        await toast.present();
      }
    }
  }
}
