import { Component, OnInit } from '@angular/core';
import {  NavController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { AuthenticationApiService } from '@app/infrastructure/services/authenticationApi.service';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';

/**
 * Password key page component that handles password change functionality.
 * Provides user interface for setting a new password and validation.
 */
@Component({
  selector: 'app-password-key',
  templateUrl: './password-key.page.html',
  styleUrls: ['./password-key.page.scss'],
})
export class PasswordKeyPage implements OnInit {
  /** New password input value */
  newPassword = '';
  /** Password confirmation input value */
  confirmPassword = '';

  constructor(
    private navCtrl: NavController,
    private storage: StorageService,
    private authenticationService: AuthenticationApiService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
) { }

  ngOnInit() {
  }

  /**
   * Navigates back to the login page
   */
  goLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  /**
   * Handles the password change process
   * Validates inputs and communicates with the authentication service
   * @throws {Error} If the password change process fails
   */
  async create(){
    if (this.newPassword == '' || this.confirmPassword == ''){
      const toast = await this.toastController.create({
        message: 'Please enter username and password',
        duration: 3000,
        position: 'middle'
      });
      await toast.present();
      return;
    }

    try {
      const loading = await this.loadingController.create({
        message: 'Connecting...',
        spinner: 'circular'
      });
      await loading.present();

      const email = await this.storage.get(STORAGE.EMAIL);
      await this.authenticationService.changePassword(email, this.newPassword);

      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Password Changed',
        message: 'Your password has been successfully changed',
        buttons: ['OK']
      });
      await alert.present();

      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      if (error instanceof Error){
        const toast = await this.toastController.create({
          message: error.message,
          duration: 3000,
          position: 'middle'
        });
        await toast.present();
        throw new Error(`Request error: ${error.message}`);
      }
      else{
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }
}
