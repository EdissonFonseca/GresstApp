import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
})
export class LocationSelectComponent  implements OnInit {
  description: string = '';
  latitude: number | null = null;
  longitude: number | null = null;

  constructor(
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {}

  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  }

  confirm() {
    this.modalCtrl.dismiss('', 'confirm');
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

}
