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
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  /**
   * Initializes the component and sets up translations
   * This method is called after the component is created
   * It sets up the default language and loads translations
   */
  ngOnInit(): void {
    // No initialization needed as translations are handled in app.component
  }

  /**
   * Handles the login process with offline mode support
   * Validates credentials and manages authentication state
   * @throws {Error} If login process fails
   */
  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;
    this.isCheckingSession = true;

    try {
      this.loading = await this.loadingController.create({
        message: this.translate.instant('AUTH.LOGIN.CHECKING_SESSION'),
        spinner: 'circular'
      });
      await this.loading.present();

      const isOnline = await this.sessionService.isOnline();
      if (isOnline) {
        const success = await this.authService.login(username, password);
        if (success) {
          await this.sessionService.load();
          await this.router.navigate(['/home']);
        } else {
          throw new Error('INVALID_CREDENTIALS');
        }
      } else {
        const alreadyLoggedIn = await this.sessionService.isActive();
        if (alreadyLoggedIn) {
          await this.router.navigate(['/home']);
        } else {
          throw new Error('NO_CONNECTION');
        }
      }
    } catch (error: any) {
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
      this.isCheckingSession = false;
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
    await this.router.navigate(['/register-email']);
  }
}
