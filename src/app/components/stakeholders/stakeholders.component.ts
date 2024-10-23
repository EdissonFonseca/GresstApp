import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CRUDOperacion, Permisos } from '@app/services/constants.service';
import { ModalController, NavController } from '@ionic/angular';
import { Tercero } from 'src/app/interfaces/tercero.interface';
import { GlobalesService } from 'src/app/services/globales.service';
import { TercerosService } from 'src/app/services/terceros.service';

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
  enableNew: boolean = false;
  showNew: boolean = false;

  constructor(
    private globales: GlobalesService,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private tercerosService: TercerosService,
    private navCtrl: NavController
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Identificacion: ['', Validators.required],
      Telefono: [''],
      Correo: [''],
    });
  }

  async ngOnInit() {
    this.terceros = await this.tercerosService.list();
    this.enableNew = (await this.globales.getPermiso(Permisos.AppTercero))?.includes(CRUDOperacion.Create);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();
    this.formData.patchValue({Nombre: this.selectedName});

    const tercerosList = await this.tercerosService.list();
    this.terceros = tercerosList.filter((tercero) => tercero.Nombre?.toLowerCase().indexOf(query) > -1);
  }

  select(idTercero: string, nombre: string) {
    this.selectedValue = idTercero;
    this.selectedName = nombre;
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  search() {
    this.showNew = false;
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  new() {
    this.showNew = true;
    this.formData.setValue({Nombre: null, Identificacion: null, Telefono: null, Correo:null });
  }

  async create() {
    if (this.formData.valid)
    {
      const formData = this.formData.value;
      const tercero: Tercero = {IdPersona: this.globales.newId(), Nombre: formData.Nombre, Identificacion: formData.Identificacion, Correo: formData.Correo, Telefono: formData.Telefono, Cliente: true};
      const created = await this.tercerosService.create(tercero);
      if (created)
      {
        const data = {id: tercero.IdPersona, name: this.selectedName};
        if (this.showHeader){
          this.modalCtrl.dismiss(data);
          this.selectedValue = tercero.IdPersona;
        }
        else{
          this.terceros = await this.tercerosService.list();
          await this.globales.presentToast(`Tercero ${formData.Nombre} creado`, 'middle');
          this.selectedValue = '';
          this.searchText = '';
        }
        this.formData.setValue({Nombre: null, Identificacion: null, Telefono: null, Correo:null });
        this.showNew = false;
      }
    }
  }

  goToPuntos(idTercero: string) {
    this.navCtrl.navigateForward(`/puntos/${idTercero}`);
  }
}
