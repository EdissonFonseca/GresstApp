import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonTabs, IonicModule } from '@ionic/angular';
import { signal } from '@angular/core';
import { StorageService } from '../../services/core/storage.service';
import { STORAGE } from '@app/constants/constants';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SessionService } from '@app/services/core/session.service';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '@app/components/components.module';
import { Router } from '@angular/router';

/**
 * HomePage component that serves as the main navigation hub of the application.
 * Handles tab navigation between actividades and inventario sections.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ComponentsModule
  ]
})
export class HomePage implements OnInit {
  /** Title displayed in the header */
  @Input() title = 'Jornada';
  /** ID of the help popup to be displayed */
  @Input() helpPopup = 'help-inventario';
  /** Reference to the tabs component */
  @ViewChild('tabs', { static: true }) tabs: IonTabs | undefined;

  /** Current active tab using Angular signals */
  currentTab = signal<string>('activities');
  /** Account name using Angular signals */
  nombreCuenta = signal<string>('');
  /** User name using Angular signals */
  nombreUsuario = signal<string>('');

  constructor(
    public sessionService: SessionService,
    private storage: StorageService,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.setHeader('HOME.TABS.SHIFT', 'help-jornada');
  }

  /**
   * Initialize component data
   * @throws {Error} If initialization fails
   */
  async ngOnInit() {
    try {
      await this.initializeData();
      await this.sessionService.countPendingRequests();
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Handle tab changes and update the current tab state
   * @param event - The tab change event
   */
  onTabChange(event: any) {
    const tab = event.tab;
    this.currentTab.set(tab);

    if (tab === 'activities') {
      this.setHeader('HOME.TABS.SHIFT', 'help-jornada');
      this.router.navigate(['/home', { outlets: { activities: ['activities'] } }]);
    } else if (tab === 'inventario') {
      this.setHeader('HOME.TABS.INVENTORY', 'help-inventario');
      this.router.navigate(['/home', { outlets: { inventario: ['inventario'] } }]);
    }
  }

  /**
   * Update header title and help popup based on the selected tab
   * @param title - The new title to display
   * @param helpPopup - The new help popup ID
   */
  setHeader(title: string, helpPopup: string) {
    try {
      this.title = this.translate.instant(title);
      this.helpPopup = helpPopup;
      const selectedTab = this.tabs?.getSelected() || 'actividades';
      this.currentTab.set(selectedTab);
    } catch (error) {
      console.error('Error setting header:', error);
      this.handleError(error);
    }
  }

  /**
   * Get current sync status
   * @returns {number} Number of pending transactions
   */
  get syncStatus(): number {
    try {
      return this.sessionService.pendingRequests();
    } catch (error) {
      console.error('Error getting sync status:', error);
      return 0;
    }
  }

  /**
   * Initialize component data by loading user and account information
   * @private
   */
  private async initializeData() {
    try {
      await Promise.all([
        this.loadUserData(),
        this.loadAccountData()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      throw error;
    }
  }

  /**
   * Load user data from storage
   * @private
   */
  private async loadUserData() {
    try {
      const user = await this.storage.get(STORAGE.USERNAME);
      if (!user) {
        throw new Error('User data not found');
      }
      this.nombreUsuario.set(user.Nombre || '');
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }

  /**
   * Load account data from storage
   * @private
   */
  private async loadAccountData() {
    try {
      const cuenta = await this.storage.get(STORAGE.ACCOUNT);
      if (!cuenta) {
        throw new Error('Account data not found');
      }
      this.nombreCuenta.set(cuenta.NombreCuenta || '');
    } catch (error) {
      console.error('Error loading account data:', error);
      throw error;
    }
  }

  /**
   * Handle errors in the component
   * @param error - The error to handle
   * @private
   */
  private async handleError(error: any) {
    console.error('Error in HomePage:', error);
    await this.userNotificationService.showToast(
      this.translate.instant('HOME.MESSAGES.LOAD_ERROR'),
      'middle'
    );
  }

  /**
   * Lifecycle hook that is called when the page is about to enter
   */
  async ionViewWillEnter() {
    try {
      await this.sessionService.countPendingRequests();
    } catch (error) {
      console.error('Error in ionViewWillEnter:', error);
      this.handleError(error);
    }
  }
}
