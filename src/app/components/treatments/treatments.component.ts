import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Tratamiento } from 'src/app/interfaces/tratamiento.interface';
import { TreatmentsService } from '@app/services/masterdata/treatments.service';

@Component({
  selector: 'app-treatments',
  templateUrl: './treatments.component.html',
  styleUrls: ['./treatments.component.scss'],
})
export class TreatmentsComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  treatments : Tratamiento[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private treatmentsService: TreatmentsService
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    this.treatments = await this.treatmentsService.list();
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const treatments = await this.treatmentsService.list();
    this.treatments = treatments.filter((treatment: Tratamiento) => treatment.Nombre .toLowerCase().indexOf(query) > -1);
  }

  select(idTratamiento: string, nombre: string) {
    this.selectedValue = idTratamiento;
    this.selectedName = nombre;
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async create() {
    // const id : string = await this.globales.createInsumo(this.selectedName);
    // const data = {id: id, name: this.selectedName};
    // if (this.showHeader){
    //   this.modalCtrl.dismiss(data);
    // }
    // else{
    //   this.selectedValue = id;
    //   this.searchText = '';
    //   this.treatments = await this.globales.getTratamientos();
    //   const toast = await this.toastCtrl.create({
    //     message: `Tratamiento ${this.selectedName} creado`,
    //     duration: 1500,
    //     position: 'top',
    //   });

    //   await toast.present();
    // }
  }
}
