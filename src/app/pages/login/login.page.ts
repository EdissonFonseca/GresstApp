import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService, FidoError } from '../../services/authentication.service';
import { SynchronizationService } from '../../services/synchronization.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private syncService: SynchronizationService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.initializeLoginForm();
  }

  ngOnInit(): void {
    this.checkSession();
  }

  /**
   * Initializes the login form with validation rules
   */
  private initializeLoginForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Checks for existing session and handles offline mode
   * Attempts to refresh token if online, falls back to offline mode if needed
   */
  async checkSession(): Promise<void> {
    try {
      this.isCheckingSession = true;
      console.log('🔄 [Login] Verificando sesión...');

      const loading = await this.loadingController.create({
        message: 'Verificando sesión...',
        spinner: 'circular'
      });

      try {
        await loading.present();
        console.log('🌐 [Login] Verificando conexión...');
        const isOnline = await this.authService.ping();
        console.log('📡 [Login] Estado de conexión:', isOnline ? 'En línea' : 'Sin conexión');

        if (isOnline) {
          console.log('🔄 [Login] Intentando restaurar sesión...');
          const sessionRestored = await this.authService.restoreSession();

          if (sessionRestored) {
            console.log('✅ [Login] Sesión restaurada, actualizando datos...');
            await this.syncService.refresh();
            await this.router.navigate(['/home']);
          } else {
            console.log('ℹ️ [Login] No hay sesión para restaurar');
          }
        } else {
          console.log('ℹ️ [Login] Modo sin conexión activado');
          await this.showToast('Está trabajando sin conexión', 'middle');
        }
      } finally {
        await loading.dismiss();
      }
    } catch (error) {
      console.error('❌ [Login] Error verificando sesión:', error);
    } finally {
      this.isCheckingSession = false;
    }
  }

  /**
   * Handles the login process with offline mode support
   * Validates credentials and manages authentication state
   */
  async login(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      const isOnline = await this.authService.ping();
      if (!isOnline) {
        await this.showError('Error de conexión', 'No se pudo conectar con el servidor');
        return;
      }

      const { username, password } = this.loginForm.value;
      const success = await this.authService.login(username, password);

      if (success) {
        await this.syncService.load();
        await this.router.navigate(['/home']);
      } else {
        await this.showError('Error de autenticación', 'Credenciales inválidas');
      }
    } catch (error: any) {
      console.error('❌ [Login] Error in login:', error);
      let errorMessage = 'Error al iniciar sesión';

      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas';
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      }

      if (error instanceof FidoError) {
        await this.router.navigate(['/fido2']);
      } else {
        await this.showError('Error', errorMessage);
      }
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Displays an error alert with the specified header and message
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
   */
  async recoverPassword(): Promise<void> {
    const { username } = this.loginForm.value;
    if (!username) {
      await this.showError('Error', 'Por favor ingrese su correo electrónico');
      return;
    }

    const isOnline = await this.authService.ping();
    if (!isOnline) {
      await this.showError('Error', 'No se puede recuperar la contraseña sin conexión');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando correo de recuperación...',
      spinner: 'circular'
    });

    try {
      await loading.present();
      // TODO: Implement password recovery logic
      await this.showError('Éxito', 'Se ha enviado un correo con las instrucciones');
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      await this.showError('Error', 'No se pudo procesar la solicitud');
    } finally {
      await loading.dismiss();
    }
  }
}
