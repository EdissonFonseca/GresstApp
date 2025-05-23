import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { PERMISSIONS, STORAGE } from '@app/constants/constants';
import { environment } from '../../../environments/environment';
import { SessionService } from '@app/services/core/session.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { TranslateService } from '@ngx-translate/core';

/**
 * Component responsible for rendering and managing the application's main menu.
 * Handles navigation, user permissions, and session management.
 */
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  /** Current user's display name */
  user: string = '';
  /** Current account's display name */
  account: string = '';
  /** Flag to control certificate menu item visibility */
  showCertificate = true;
  /** Flag to control account menu item visibility */
  showAccount = true;
  /** Flag to control packaging menu item visibility */
  showPackage = true;
  /** Flag to control supplies menu item visibility */
  showSupply = true;
  /** Flag to control materials menu item visibility */
  showMaterial = true;
  /** Flag to control services menu item visibility */
  showService = true;
  /** Flag to control points menu item visibility */
  showPoint = true;
  /** Flag to control third parties menu item visibility */
  showThirdParty = true;
  /** Flag to control treatments menu item visibility */
  showTreatment = true;
  /** Flag to control vehicles menu item visibility */
  showVehicle = true;
  /** Flag to control force quit option visibility */
  showForceQuit = false;
  /** Current third party ID */
  idThirdParty: string = '';
  /** Debug mode flag */
  debug: boolean = true;

  constructor(
    private storage: StorageService,
    private navCtrl: NavController,
    private router: Router,
    private menuCtrl: MenuController,
    private sessionService: SessionService,
    private authorizationService: AuthorizationService,
    private notificationService: UserNotificationService,
    private translate: TranslateService
  ) { }

  /**
   * Initializes the component by loading user data and permissions.
   * Sets up visibility flags for menu items based on user permissions.
   */
  async ngOnInit() {
    try {
      const cuenta = await this.storage.get(STORAGE.ACCOUNT);
      if (!cuenta) {
        throw new Error('Account information not found');
      }

      this.idThirdParty = cuenta.IdPersona;
      this.account = cuenta.Nombre;
      this.user = cuenta.NombreUsuario;

      // Load user permissions for menu items
      await this.loadPermissions();

      this.debug = !environment.production;
    } catch (error) {
      console.error('Error initializing menu component:', error);
      await this.notificationService.showToast(
        this.translate.instant('MENU.MESSAGES.INIT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Loads and sets user permissions for menu items
   * @private
   */
  private async loadPermissions(): Promise<void> {
    try {
      this.showCertificate = await this.authorizationService.getPermission(PERMISSIONS.APP_CERTIFICATE) !== '';
      this.showAccount = await this.authorizationService.getPermission(PERMISSIONS.APP_ACCOUNT) !== '';
      this.showPackage = await this.authorizationService.getPermission(PERMISSIONS.APP_PACKAGE) !== '';
      this.showSupply = await this.authorizationService.getPermission(PERMISSIONS.APP_SUPPLY) !== '';
      this.showMaterial = await this.authorizationService.getPermission(PERMISSIONS.APP_MATERIAL) !== '';
      this.showService = await this.authorizationService.getPermission(PERMISSIONS.APP_SERVICE) !== '';
      this.showPoint = await this.authorizationService.getPermission(PERMISSIONS.APP_POINT) !== '';
      this.showThirdParty = await this.authorizationService.getPermission(PERMISSIONS.APP_THIRD_PARTY) !== '';
      this.showTreatment = await this.authorizationService.getPermission(PERMISSIONS.APP_TREATMENT) !== '';
      this.showVehicle = await this.authorizationService.getPermission(PERMISSIONS.APP_VEHICLE) !== '';
    } catch (error) {
      console.error('Error loading permissions:', error);
      throw error;
    }
  }

  /**
   * Generates initials from a given name
   * @param name - The full name to generate initials from
   * @returns A string containing the initials
   */
  getInitials(name: string): string {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(name => name[0]).join('');
  }

  /**
   * Navigates to the points page for the current third party
   * Closes the menu before navigation
   */
  navigateToPoints() {
    try {
      this.menuCtrl.close();
      this.navCtrl.navigateForward(`/points/${this.idThirdParty}`);
    } catch (error) {
      console.error('Error navigating to points:', error);
      this.notificationService.showToast(
        this.translate.instant('MENU.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Navigates to a specified page
   * @param page - The route to navigate to
   */
  navigateTo(page: string) {
    try {
      this.menuCtrl.close();
      this.router.navigate([page]);
    } catch (error) {
      console.error('Error navigating to page:', error);
      this.notificationService.showToast(
        this.translate.instant('MENU.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Navigates to the synchronization page
   */
  async synchronize() {
    try {
      this.navCtrl.navigateForward('/synchronization');
    } catch (error) {
      console.error('Error navigating to sync page:', error);
      this.notificationService.showToast(
        this.translate.instant('MENU.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Closes the menu
   */
  close() {
    try {
      this.menuCtrl.close();
    } catch (error) {
      console.error('Error closing menu:', error);
    }
  }

  /**
   * Handles the logout process
   * Attempts to synchronize data before logging out
   * Shows force quit option if synchronization fails
   */
  async logout() {
    try {
      await this.notificationService.showLoading(this.translate.instant('MENU.MESSAGES.SYNCHRONIZING'));
      const sessionEnded = await this.sessionService.end();
      await this.notificationService.hideLoading();

      if (sessionEnded) {
        this.navCtrl.navigateRoot('/login');
      } else {
        await this.notificationService.showAlert(
          this.translate.instant('MENU.MESSAGES.LOGOUT_ERROR'),
          'middle'
        );
        this.showForceQuit = true;
      }
    } catch (error) {
      console.error('Error during logout:', error);
      await this.notificationService.hideLoading();
      await this.notificationService.showToast(
        this.translate.instant('MENU.MESSAGES.SYNC_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Handles the force quit process
   * Creates a backup of unsynchronized data before closing
   * Requires user confirmation before proceeding
   */
  async forceQuit() {
    try {
      const confirmed = await this.notificationService.showConfirm(
        this.translate.instant('MENU.MESSAGES.FORCE_QUIT_TITLE'),
        this.translate.instant('MENU.MESSAGES.FORCE_QUIT_MESSAGE'),
        this.translate.instant('MENU.MESSAGES.FORCE_QUIT_CONFIRM'),
        this.translate.instant('MENU.MESSAGES.FORCE_QUIT_CANCEL')
      );

      if (confirmed) {
        await this.notificationService.showLoading(this.translate.instant('MENU.MESSAGES.GENERATING_BACKUP'));
        await this.sessionService.forceQuit();
        await this.notificationService.hideLoading();
        this.navCtrl.navigateRoot('/login');
      }
    } catch (error) {
      console.error('Error during force quit:', error);
      await this.notificationService.hideLoading();
      await this.notificationService.showToast(
        this.translate.instant('MENU.MESSAGES.FORCE_QUIT_ERROR'),
        'middle'
      );
    }
  }
}
