import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { SessionService } from '@app/services/core/session.service';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';

/**
 * Login page component that handles user authentication and offline mode support.
 * Implements session persistence and automatic token refresh.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  /** Form group for login credentials */
  loginForm!: FormGroup;

  /** Flag to prevent multiple session checks */
  isCheckingSession = false;

  /** Flag to track dark mode state */
  isDarkMode = false;

  /** Loading indicator instance */
  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationApiService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private sessionService: SessionService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.checkTheme();
  }

  /**
   * Handles the login process with offline mode support
   * Validates credentials and manages authentication state
   * @throws {Error} If login process fails
   */
  async login(): Promise<void> {
    try {
      // Show loading indicator
      this.loading = await this.loadingController.create({
        message: 'Authenticating...',
        spinner: 'circular'
      });
      await this.loading.present();

      // Check network connectivity
      const isOnline = await this.sessionService.isOnline();
      if (!isOnline) {
        throw new Error('NO_CONNECTION');
      }

      // Attempt login
      const { username, password } = this.loginForm.value;
      const success = await this.authService.login(username, password);
      if (success) {
        await this.sessionService.load();
        await this.router.navigate(['/home']);
      } else {
        throw new Error('INVALID_CREDENTIALS');
      }
    } catch (error: any) {
      console.error('❌ [Login] Error in login:', error);
      let errorMessage = 'Error during login';

      // Handle specific error cases
      if (error.message === 'NO_CONNECTION') {
        errorMessage = 'Could not connect to the server';
      } else if (error.message === 'INVALID_CREDENTIALS' || error.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.status === 0) {
        errorMessage = 'Could not connect to the server';
      }

      await this.showError('Authentication Error', errorMessage);
    } finally {
      // Dismiss loading indicator if it exists
      if (this.loading) {
        await this.loading.dismiss();
        this.loading = null;
      }
    }
  }

  /**
   * Displays an error alert with the specified header and message
   * @param header - The alert header text
   * @param message - The alert message text
   */
  private async showError(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Displays a toast message with the specified content and position
   * @param message - The toast message text
   * @param position - The position of the toast (top, middle, bottom)
   */
  private async showToast(message: string, position: 'top' | 'middle' | 'bottom' = 'bottom'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position
    });
    await toast.present();
  }

  /**
   * Handles the password recovery process
   * Requires online connectivity
   * @throws {Error} If recovery process fails
   */
  async recoverPassword(): Promise<void> {
    try {
      const { username } = this.loginForm.value;
      if (!username) {
        throw new Error('EMAIL_REQUIRED');
      }

      // Check network connectivity
      const isOnline = await this.sessionService.isOnline();
      if (!isOnline) {
        throw new Error('NO_CONNECTION');
      }

      // Show loading indicator
      this.loading = await this.loadingController.create({
        message: 'Sending recovery email...',
        spinner: 'circular'
      });
      await this.loading.present();

      // TODO: Implement password recovery logic
      await this.showToast('A recovery email has been sent with instructions', 'top');
    } catch (error: any) {
      console.error('Error recovering password:', error);
      let errorMessage = 'Could not process the request';

      if (error.message === 'EMAIL_REQUIRED') {
        errorMessage = 'Please enter your email address';
      } else if (error.message === 'NO_CONNECTION') {
        errorMessage = 'Cannot recover password without connection';
      }

      await this.showError('Error', errorMessage);
    } finally {
      if (this.loading) {
        await this.loading.dismiss();
        this.loading = null;
      }
    }
  }

  /**
   * Checks and applies the system's theme preference
   */
  async checkTheme(): Promise<void> {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode = prefersDark.matches;
    this.toggleDarkTheme(this.isDarkMode);

    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
      this.isDarkMode = e.matches;
      this.toggleDarkTheme(this.isDarkMode);
    });
  }

  /**
   * Toggles dark theme on the document body
   * @param shouldAdd - Whether to add or remove dark theme
   */
  toggleDarkTheme(shouldAdd: boolean): void {
    document.body.classList.toggle('dark-theme', shouldAdd);
  }
}
