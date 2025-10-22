import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AuthenticationApiService } from '@app/infrastructure/services/authenticationApi.service';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';
import { User } from '@app/domain/entities/user.entity';

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
  user: User | undefined = undefined;
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
    this.user = await this.storage.get(STORAGE.USER);

    this.formData.patchValue({
      Nombre: this.user?.Name,
      Correo: this.user?.Email
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
    const user = await this.storage.get(STORAGE.USER);
    const formValues = this.formData.value;

    try {
      await this.authenticationService.changeName(user.Email, formValues.Nombre);
      if (this.user) {
        this.user.Name = formValues.Nombre;
        await this.storage.set(STORAGE.USER, this.user);
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
    const user = await this.storage.get(STORAGE.USER);
    const currentPassword = '';

    if (this.formData.valid) {
      const formValues = this.formData.value;
      if (formValues.ClaveNueva !== formValues.ClaveConfirmar) {
        await this.presentAlert('Error', 'Error', 'New password and confirmation do not match');
      } else if (formValues.ClaveActual !== currentPassword) {
        await this.presentAlert('Error', 'Error', 'Current password is incorrect');
      } else {
        try {
          await this.authenticationService.changePassword(user.Email, formValues.ClaveNueva);
          //await this.storage.set('Password', formValues.ClaveNueva);
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
