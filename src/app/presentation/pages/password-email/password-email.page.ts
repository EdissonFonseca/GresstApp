import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationApiService } from '@app/infrastructure/services/authenticationApi.service';
import { MailService } from '@app/infrastructure/services/mail.service';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';

/**
 * Page component for password recovery via email
 * Handles the email verification process for password recovery
 */
@Component({
  selector: 'app-password-email',
  templateUrl: './password-email.page.html',
  styleUrls: ['./password-email.page.scss'],
  standalone: false
})
export class PasswordEmailPage implements OnInit {
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
   * Navigate to login page
   */
  goLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  /**
   * Verify email and send verification code
   * Checks if the email exists and sends a verification code if it does
   */
  async verify() {
    const loading = await this.loadingController.create({
      message: 'Connecting...',
      spinner: 'circular'
    });

    try {
      await loading.present();

      const exist = await this.authenticationService.existUser(this.email);
      if (exist) {
        this.verificationCode = await this.mailService.sendWithToken(
          this.email,
          'Gresst - Password Change',
          'To continue, enter the following code: {Token}, in the app'
        );

        if (this.verificationCode) {
          const session = await this.storage.get(STORAGE.SESSION);
          session.Email = this.email;
          session.VerificationCode = this.verificationCode;
          await this.storage.set(STORAGE.SESSION, session);
          this.navCtrl.navigateRoot('/password-code');
        }
      } else {
        await this.presentToast('This email is not registered', 'middle');
        this.email = '';
      }
    } catch (error) {
      if (error instanceof Error) {
        await this.presentToast(error.message, 'middle');
      } else {
        await this.presentToast('User does not exist', 'middle');
      }
      this.email = '';
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
