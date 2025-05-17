import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { MailService } from '@app/services/core/mail.service';
import { StorageService } from '@app/services/core/storage.service';
import { STORAGE } from '@app/constants/constants';

/**
 * Page component for user registration email verification
 * Handles the initial registration process by validating email and sending verification code
 */
@Component({
  selector: 'app-register-email',
  templateUrl: './register-email.page.html',
  styleUrls: ['./register-email.page.scss'],
})
export class RegisterEmailPage implements OnInit {
  name = '';
  email = '';
  verificationCode = '';

  constructor(
    private authenticationService: AuthenticationApiService,
    private menuCtrl: MenuController,
    private mailService: MailService,
    private storage: StorageService,
    private navCtrl: NavController,
    private loadingController: LoadingController,
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
   * Verify email and send verification code
   * Checks if email exists and sends verification code if it doesn't
   */
  async verify() {
    const loading = await this.loadingController.create({
      message: 'Connecting...',
      spinner: 'circular'
    });

    try {
      await loading.present();

      const exist = await this.authenticationService.existUser(this.email);
      if (!exist) {
        this.verificationCode = await this.mailService.sendWithToken(
          this.email,
          'Welcome to Gresst',
          'Enter the following code: {Token} in the app to continue'
        );

        if (this.verificationCode) {
          await this.storage.set(STORAGE.EMAIL, this.email);
          await this.storage.set(STORAGE.FULLNAME, this.name);
          await this.storage.set(STORAGE.VERIFICATION_CODE, this.verificationCode);
          this.navCtrl.navigateRoot('/register-code');
        }
      } else {
        await this.presentToast('This email is already registered', 'middle');
      }
    } catch (error) {
      if (error instanceof Error) {
        await this.presentToast(error.message, 'middle');
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    } finally {
      await loading.dismiss();
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
