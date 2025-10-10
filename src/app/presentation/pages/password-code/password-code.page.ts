import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, ToastController } from '@ionic/angular';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';

/**
 * Page component for verification code validation
 * Handles the verification code check for password recovery process
 */
@Component({
  selector: 'app-password-code',
  templateUrl: './password-code.page.html',
  styleUrls: ['./password-code.page.scss'],
})
export class PasswordCodePage implements OnInit {
  verificationCode = '';

  constructor(
    private menuCtrl: MenuController,
    private storage: StorageService,
    private navCtrl: NavController,
    private toastController: ToastController
  ) { }

  /**
   * Initialize the page
   * Disables the menu for this page
   */
  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  /**
   * Navigate to login page
   */
  goLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  /**
   * Verify the entered code against the stored code
   * If valid, navigates to password change page
   */
  async verify() {
    try {
      const generatedCode = await this.storage.get(STORAGE.VERIFICATION_CODE);

      if (this.verificationCode !== generatedCode) {
        await this.presentToast('The code does not match', 'middle');
      } else {
        this.navCtrl.navigateRoot('/password-key');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  /**
   * Present a toast message
   * @param message The message to display
   * @param position The position of the toast
   */
  private async presentToast(message: string, position: 'top' | 'bottom' | 'middle' = 'bottom') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position,
      color: 'dark'
    });
    await toast.present();
  }
}

