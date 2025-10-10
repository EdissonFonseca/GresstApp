import { Component, Input, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Service } from '@app/domain/entities/service.entity';
import { ServiceRepository } from '@app/infrastructure/repositories/service.repository';
import { SERVICES } from '@app/core/constants';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  @Input() showHeader: boolean = true;
  services: Service[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';
  items: { id: string, name: string, selected: boolean }[] = [];

  constructor(
    private servicesService: ServiceRepository,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    this.services = await this.servicesService.getAll();

    SERVICES.forEach((item) => {
      const selected = this.services.some(x => x.Id === item.serviceId);
      this.items.push({
        id: item.serviceId,
        name: item.Name,
        selected: selected
      });
    });
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
