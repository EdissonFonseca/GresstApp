import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Servicio } from 'src/app/interfaces/servicio.interface';
import { Globales } from 'src/app/services/globales.service';

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
    private route: ActivatedRoute,
    private globales: Globales,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    this.services = await this.globales.getServicios();

    this.globales.servicios.forEach((item) => {
      var selected = false;

      const selectedItem = this.services.find(x => x.IdServicio === item.IdServicio);
      selected = (selectedItem != null);
      const newItem = {
        id: item.IdServicio,
        name: item.Accion,
        selected: selected,
      };
      this.items.push(newItem);
    });
  }

  async changeSelection(idServicio: string, checked:boolean) {
    if (checked) {
      await this.globales.addServicio(idServicio);
      const toast = await this.toastCtrl.create({
        message: `Servicio agregado`,
        duration: 1500,
        position: 'top',
      });
      await toast.present();
    } else {
      await this.globales.deleteServicio(idServicio);
      const toast = await this.toastCtrl.create({
        message: `Servicio eliminado`,
        duration: 1500,
        position: 'top',
      });
      await toast.present();
    }

  }
}
