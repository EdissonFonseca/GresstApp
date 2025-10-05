import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  async showToast(message: string, position: 'top' | 'middle' | 'bottom' = 'bottom'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position,
      color: 'dark'
    });
    await toast.present();
  }

  async showLoading(message: string): Promise<void> {
    this.loading = await this.loadingController.create({
      message,
      spinner: 'circular'
    });
    await this.loading.present();
  }

  async hideLoading(): Promise<void> {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Shows a confirmation dialog with custom buttons
   * @param header The header text of the dialog
   * @param message The message to display
   * @param confirmText The text for the confirm button (default: 'Confirmar')
   * @param cancelText The text for the cancel button (default: 'Cancelar')
   * @returns Promise<boolean> True if confirmed, false if cancelled
   */
  async showConfirm(
    header: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }
}