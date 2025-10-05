import { Component, Input, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Servicio } from '@app/domain/entities/servicio.entity';
import { ServicesService } from '@app/infrastructure/repositories/masterdata/services.repository';
import { SERVICES } from '@app/core/constants';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  @Input() showHeader: boolean = true;
  services: Servicio[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';
  items: { id: string, name: string, selected: boolean }[] = [];

  constructor(
    private servicesService: ServicesService,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    this.services = await this.servicesService.list();

    SERVICES.forEach((item) => {
      const selected = this.services.some(x => x.IdServicio === item.serviceId);
      this.items.push({
        id: item.serviceId,
        name: item.Name,
        selected: selected
      });
    });
  }

  async changeSelection(idServicio: string, checked: boolean) {
    try {
      if (checked) {
        await this.servicesService.create(idServicio);
        await this.showToast('Servicio agregado');
      } else {
        await this.servicesService.delete(idServicio);
        await this.showToast('Servicio eliminado');
      }
    } catch (error) {
      await this.showToast('Error al modificar el servicio');
      console.error('Error changing service selection:', error);
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'top',
    });
    await toast.present();
  }
}
