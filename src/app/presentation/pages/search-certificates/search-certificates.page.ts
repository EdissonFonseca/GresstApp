import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { OperationsApiService } from '@app/infrastructure/repositories/api/operationsApi.repository';
import { StorageService } from '@app/infrastructure/repositories/api/storage.repository';
import { STORAGE } from '@app/core/constants';

@Component({
  selector: 'app-search-certificates',
  templateUrl: './search-certificates.page.html',
  styleUrls: ['./search-certificates.page.scss'],
})
export class SearchCertificatesPage implements OnInit {
  certificateType = '';
  selectedDate?: Date;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private operationsService: OperationsApiService,
    private storage: StorageService
  ) { }

  ngOnInit() {
  }

  onCertificateTypeChange(type: string) {
    this.certificateType = type;
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
  }

  async buscar() {
    if (!this.certificateType) {
      await this.presentToast('Por favor seleccione un tipo de certificado');
      return;
    }

    if (!this.selectedDate) {
      await this.presentToast('Por favor seleccione una fecha');
      return;
    }

    try {
      const transaction = await this.storage.get(STORAGE.TRANSACTION);
      const success = await this.operationsService.emitCertificate(transaction);

      if (success) {
        await this.presentToast('Certificado emitido exitosamente', 'success');
      } else {
        await this.presentToast('Error al emitir el certificado', 'danger');
      }
    } catch (error) {
      await this.presentToast('Error al emitir el certificado', 'danger');
    }
  }

  private async presentToast(message: string, color: string = 'dark') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'middle',
      color
    });
    await toast.present();
  }
}
