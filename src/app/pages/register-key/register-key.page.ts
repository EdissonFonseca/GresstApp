import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { StorageService } from '@app/services/core/storage.service';

/**
 * Page component for user registration
 * Handles the password creation process for new user registration
 */
@Component({
  selector: 'app-register-key',
  templateUrl: './register-key.page.html',
  styleUrls: ['./register-key.page.scss'],
})
export class RegisterKeyPage implements OnInit {
  newPassword = '';
  confirmPassword = '';

  constructor(
    private authenticationService: AuthenticationApiService,
    private navCtrl: NavController,
    private storage: StorageService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  /**
   * Create new user account with provided password
   * Validates input and handles the registration process
   */
  async create() {
    if (this.newPassword === '' || this.confirmPassword === '') {
      await this.presentAlert('Error', '', 'Please enter username and password');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Connecting...',
      spinner: 'circular'
    });

    try {
      await loading.present();
      const email = await this.storage.get('Email');
      const name = await this.storage.get('Name');

      await this.authenticationService.register(email, name, this.newPassword);
      await this.presentAlert('User registered', '', 'User registered successfully');
      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Present an alert dialog
   * @param header The header text
   * @param subHeader The subheader text
   * @param message The message text
   */
  private async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alertController.create({
      header,
      subHeader,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
