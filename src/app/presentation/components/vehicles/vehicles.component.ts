import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Vehicle } from '@app/domain/entities/vehicle.entity';
import { VehicleRepository } from '@app/infrastructure/repositories/vehicles.repository';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss'],
})
export class VehiclesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  vehicles : Vehicle[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private vehicleRepository: VehicleRepository
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    this.vehicles = await this.vehicleRepository.getAll();
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const vehiclesList = await this.vehicleRepository.getAll();
    this.vehicles = vehiclesList.filter((vehicle: Vehicle) => (vehicle.Name??vehicle.Id).toLowerCase().indexOf(query) > -1);
  }

  select(idVehicle: string) {
    this.selectedValue = idVehicle;
    this.selectedName = idVehicle;
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async create() {
    // const id : string = await this.globales.createVehicle(this.selectedName);
    // const data = {id: id, name: this.selectedName};
    // if (this.showHeader){
    //   this.modalCtrl.dismiss(data);
    // }
    // else{
    //   this.selectedValue = id;
    //   this.searchText = '';
    //   this.vehicles = await this.globales.getVehiculos();
    //   const toast = await this.toastCtrl.create({
    //     message: `Vehiculo ${this.selectedName} creado`,
    //     duration: 1500,
    //     position: 'top',
    //   });

    //   await toast.present();
    // }
  }
}
