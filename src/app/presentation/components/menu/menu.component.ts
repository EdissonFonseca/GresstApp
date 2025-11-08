import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { PERMISSIONS, STORAGE } from '@app/core/constants';
import { environment } from '@env/environment';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { TranslateService } from '@ngx-translate/core';

/**
 * Component responsible for rendering and managing the application's main menu.
 * Handles navigation, user permissions, and session management.
 */
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  standalone: false,
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
  /** Current third party ID */
  idThirdParty: string = '';
  /** Debug mode flag */
  debug: boolean = true;

  constructor(
    private storage: StorageService,
    private navCtrl: NavController,
    private router: Router,
    private menuCtrl: MenuController,
    private authorizationService: AuthorizationRepository,
    private notificationService: UserNotificationService,
    private translate: TranslateService
  ) { }

  /**
   * Initializes the component by loading user data and permissions.
   * Sets up visibility flags for menu items based on user permissions.
   */
  async ngOnInit() {
    try {
      // Load account information
      const cuenta = await this.storage.get(STORAGE.ACCOUNT);
      if (cuenta) {
        this.idThirdParty = cuenta.PersonId;
        this.account = cuenta.Name;
      }

      // Load user information
      const usuario = await this.storage.get(STORAGE.USER);
      if (usuario) {
        this.user = usuario.Name;
      }

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
      this.showPoint = await this.authorizationService.getPermission(PERMISSIONS.APP_FACILITY) !== '';
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
   * Navigates to the logout page
   */
  logout() {
    try {
      this.menuCtrl.close();
      this.router.navigate(['/logout'], { queryParams: { canCancel: 'true' } });
    } catch (error) {
      console.error('Error navigating to logout:', error);
      this.notificationService.showToast(
        this.translate.instant('MENU.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }
}
