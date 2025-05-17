import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Cuenta } from '@app/interfaces/cuenta.interface';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { StorageService } from '@app/services/core/storage.service';

/**
 * Page component for user profile management
 * Handles user name and password changes
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  formData: FormGroup;
  cuenta: Cuenta | undefined = undefined;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationApiService,
    private storage: StorageService,
    private alertController: AlertController
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Correo: [],
      ClaveActual: ['', Validators.required],
      ClaveNueva: ['', Validators.required],
      ClaveConfirmar: ['', Validators.required],
    });
  }

  /**
   * Initialize the page
   * Loads user account data and populates the form
   */
  async ngOnInit() {
    this.cuenta = await this.storage.get('Cuenta');

    this.formData.patchValue({
      Nombre: this.cuenta?.NombreUsuario,
      Correo: this.cuenta?.LoginUsuario
    });
  }

  /**
   * Toggle password visibility
   */
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Change user's name
   * Updates the name in the backend and local storage
   */
  async changeName() {
    const userName = await this.storage.get('Login');
    const formValues = this.formData.value;

    try {
      await this.authenticationService.changeName(userName, formValues.Nombre);
      if (this.cuenta) {
        this.cuenta.NombreUsuario = formValues.Nombre;
        await this.storage.set('Cuenta', this.cuenta);
      }
      await this.presentAlert('Name changed', '', 'Your name has been successfully changed');
    } catch (error) {
      await this.presentAlert('Error', '', 'An error occurred while changing your name');
    }
    this.showPassword = false;
  }

  /**
   * Change user's password
   * Validates current password and updates to new password
   */
  async changePassword() {
    const userName = await this.storage.get('Login');
    const currentPassword = await this.storage.get('Password');

    if (this.formData.valid) {
      const formValues = this.formData.value;
      if (formValues.ClaveNueva !== formValues.ClaveConfirmar) {
        await this.presentAlert('Error', 'Error', 'New password and confirmation do not match');
      } else if (formValues.ClaveActual !== currentPassword) {
        await this.presentAlert('Error', 'Error', 'Current password is incorrect');
      } else {
        try {
          await this.authenticationService.changePassword(userName, formValues.ClaveNueva);
          await this.storage.set('Password', formValues.ClaveNueva);
          await this.presentAlert('Password changed', '', 'Your password has been successfully changed');
        } catch (error) {
          await this.presentAlert('Error', '', 'An error occurred while changing your password');
        }
        this.showPassword = false;
      }
    } else {
      console.log('Invalid form');
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
