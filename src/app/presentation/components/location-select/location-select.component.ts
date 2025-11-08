import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
  standalone: false
})
export class LocationSelectComponent implements OnInit {
  description: string = '';
  latitude: number | null = null;
  longitude: number | null = null;
  isLoading: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  async getLocation() {
    this.isLoading = true;
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      await this.showToast('Ubicación obtenida exitosamente', 'success');
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      let errorMessage = 'Error al obtener la ubicación';

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación';
            break;
        }
      }

      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  confirm() {
    if (!this.latitude || !this.longitude) {
      this.showToast('Por favor, obtén una ubicación primero', 'warning');
      return;
    }
    this.modalCtrl.dismiss({
      description: this.description,
      latitude: this.latitude,
      longitude: this.longitude
    }, 'confirm');
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
