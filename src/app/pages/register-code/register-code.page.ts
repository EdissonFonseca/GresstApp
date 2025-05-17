import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, ToastController } from '@ionic/angular';
import { StorageService } from '@app/services/core/storage.service';

/**
 * Page component for registration code verification
 * Handles the verification code check for new user registration process
 */
@Component({
  selector: 'app-register-code',
  templateUrl: './register-code.page.html',
  styleUrls: ['./register-code.page.scss'],
})
export class RegisterCodePage implements OnInit {
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
   * Verify the entered code against the stored code
   * If valid, navigates to password creation page
   */
  async verify() {
    try {
      const generatedCode = await this.storage.get('Code');

      if (this.verificationCode !== generatedCode) {
        await this.presentToast('The code does not match', 'middle');
      } else {
        this.navCtrl.navigateRoot('/register-key');
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

