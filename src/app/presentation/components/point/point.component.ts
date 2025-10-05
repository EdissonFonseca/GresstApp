import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ModalController } from '@ionic/angular';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.scss'],
})
export class PointComponent  implements OnInit {
  longitude: string= '';
  latitude: string = '';
  idPropietario: string | null = null;
  propietario: string | null = null;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  async getGeoLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const location = coordinates;
      this.longitude = location.coords.longitude.toString();
      this.latitude = location.coords.latitude.toString();
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  }

  async selectPropietario() {
    const modal =   await this.modalCtrl.create({
      component: StakeholdersComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idPropietario = data.data.id;
        this.propietario = data.data.name;
      }
    });

    return await modal.present();
  }
}
