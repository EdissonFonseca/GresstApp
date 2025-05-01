import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SynchronizationService } from '@app/services/synchronization.service';
import { IonTabs } from '@ionic/angular';
import { signal } from '@angular/core';
import { StorageService } from '@app/services/storage.service';
import { GlobalesService } from '@app/services/globales.service';

/**
 * HomePage component that serves as the main navigation hub of the application.
 * Handles tab navigation between actividades and inventario sections.
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @Input() title = 'Jornada';
  @Input() helpPopup = 'help-inventario';
  @ViewChild('tabs', { static: true }) tabs: IonTabs | undefined;

  // State management using signals
  currentTab = signal<string>('actividades');
  nombreCuenta = signal<string>('');
  nombreUsuario = signal<string>('');

  constructor(
    public synchronizationService: SynchronizationService,
    private storage: StorageService,
    private globales: GlobalesService
  ) {}

  /**
   * Initialize component data and count pending transactions
   */
  async ngOnInit() {
    try {
      await this.initializeData();
      this.synchronizationService.countPendingTransactions();
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Handle tab changes
   */
  onTabChange(event: any) {
    this.currentTab.set(event.tab);
  }

  /**
   * Update header title and help popup
   */
  setHeader(title: string, helpPopup: string) {
    this.title = title;
    this.helpPopup = helpPopup;
    this.currentTab.set(this.tabs?.getSelected() || 'actividades');
  }

  /**
   * Get current sync status
   */
  get syncStatus() {
    return this.synchronizationService.pendingTransactions();
  }

  /**
   * Initialize component data
   */
  private async initializeData() {
    await Promise.all([
      this.loadUserData(),
      this.loadAccountData()
    ]);
  }

  /**
   * Load user data from storage
   */
  private async loadUserData() {
    try {
      const user = await this.storage.get('User');
      if (user) {
        this.nombreUsuario.set(user.Nombre || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  /**
   * Load account data from storage
   */
  private async loadAccountData() {
    try {
      const cuenta = await this.storage.get('Cuenta');
      if (cuenta) {
        this.nombreCuenta.set(cuenta.NombreCuenta || '');
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    }
  }

  /**
   * Handle errors in the component
   */
  private async handleError(error: any) {
    console.error('Error en HomePage:', error);
    await this.globales.presentToast(
      'Error al cargar los datos. Por favor, intente de nuevo.',
      'middle'
    );
  }
}
