import { Component, Input, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Servicio } from 'src/app/interfaces/servicio.interface';
import { ServicesService } from '@app/services/masterdata/services.service';
import { SERVICIOS } from '@app/constants/constants';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  services : Servicio[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';
  items: { id: string, name: string; selected: boolean }[] = [];

  constructor(
    private servicesService: ServicesService,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    this.services = await this.servicesService.list();

    SERVICIOS.forEach((item: Servicio) => {
      var selected = false;

      const selectedItem = this.services.find(x => x.IdServicio === item.IdServicio);
      selected = (selectedItem != null);
      const newItem = {
        id: item.IdServicio,
        name: item.Nombre,
        selected: selected,
      };
      this.items.push(newItem);
    });
  }

  async changeSelection(idServicio: string, checked:boolean) {
    if (checked) {
      await this.servicesService.create(idServicio);
      const toast = await this.toastCtrl.create({
        message: `Servicio agregado`,
        duration: 1500,
        position: 'top',
      });
      await toast.present();
    } else {
      await this.servicesService.delete(idServicio);
      const toast = await this.toastCtrl.create({
        message: `Servicio eliminado`,
        duration: 1500,
        position: 'top',
      });
      await toast.present();
    }

  }
}
