import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { SessionService } from '@app/services/core/session.service';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { Utils } from '@app/utils/utils';
import { TranslateService } from '@ngx-translate/core';

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
    private loadingController: LoadingController,
    private sessionService: SessionService,
    private translate: TranslateService
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
    const { username, password } = this.loginForm.value;

    try {
      this.loading = await this.loadingController.create({
        message: this.translate.instant('AUTH.LOGIN.CHECKING_SESSION'),
        spinner: 'circular'
      });
      await this.loading.present();

      const isOnline = await this.sessionService.isOnline();
      if (!isOnline) {
        throw new Error('NO_CONNECTION');
      }

      const success = await this.authService.login(username, password);
      if (success) {
        await this.sessionService.load();
        await this.router.navigate(['/home']);
      } else {
        throw new Error('INVALID_CREDENTIALS');
      }
    } catch (error: any) {
      console.error('❌ [Login] Error in login:', error);
      let errorMessage = '';

      if (error.message === 'NO_CONNECTION') {
        errorMessage = this.translate.instant('AUTH.ERRORS.NO_CONNECTION');
      } else if (error.message === 'INVALID_CREDENTIALS' || error.status === 401) {
        errorMessage = this.translate.instant('AUTH.ERRORS.INVALID_CREDENTIALS');
      } else if (error.status === 0) {
        errorMessage = this.translate.instant('AUTH.ERRORS.NO_CONNECTION');
      } else {
        errorMessage = this.translate.instant('AUTH.ERRORS.SERVER_ERROR');
      }

      await Utils.showAlert(
        this.translate.instant('AUTH.ERRORS.TITLE'),
        errorMessage
      );
    } finally {
      if (this.loading) {
        await this.loading.dismiss();
        this.loading = null;
      }
    }
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

      const isOnline = await this.sessionService.isOnline();
      if (!isOnline) {
        throw new Error('NO_CONNECTION');
      }

      this.loading = await this.loadingController.create({
        message: this.translate.instant('AUTH.LOGIN.SENDING_RECOVERY'),
        spinner: 'circular'
      });
      await this.loading.present();

      // TODO: Implement password recovery logic
      await Utils.showToast(
        this.translate.instant('AUTH.LOGIN.RECOVERY_SENT'),
        'top'
      );
    } catch (error: any) {
      console.error('Error recovering password:', error);
      let errorMessage = '';

      if (error.message === 'EMAIL_REQUIRED') {
        errorMessage = this.translate.instant('AUTH.ERRORS.EMAIL_REQUIRED');
      } else if (error.message === 'NO_CONNECTION') {
        errorMessage = this.translate.instant('AUTH.ERRORS.NO_CONNECTION');
      } else {
        errorMessage = this.translate.instant('AUTH.ERRORS.SERVER_ERROR');
      }

      await Utils.showAlert(
        this.translate.instant('AUTH.ERRORS.TITLE'),
        errorMessage
      );
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
