import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SynchronizationService } from '../../services/core/synchronization.service';
import { IonTabs } from '@ionic/angular';
import { signal } from '@angular/core';
import { StorageService } from '../../services/core/storage.service';
import { SessionService } from '@app/services/core/session.service';
import { Router } from '@angular/router';
import { Utils } from '@app/utils/utils';
import { STORAGE } from '@app/constants/constants';

/**
 * HomePage component that serves as the main navigation hub of the application.
 * Handles tab navigation between actividades and inventario sections.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
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
    private sessionService: SessionService,
    private router: Router
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
      const user = await this.storage.get(STORAGE.USERNAME);
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
      const cuenta = await this.storage.get(STORAGE.ACCOUNT);
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
    await Utils.showToast(
      'Error al cargar los datos. Por favor, intente de nuevo.',
      'middle'
    );
  }

  async ionViewWillEnter() {
    console.log('🔄 [Home] Verificando estado de la aplicación...');
    try {
      console.log('🌐 [Home] Verificando conexión...');
      const isOnline = await this.sessionService.isOnline();
      console.log('📡 [Home] Estado de conexión:', isOnline ? 'En línea' : 'Sin conexión');

      if (isOnline) {
        console.log('🔄 [Home] Actualizando datos...');
        await this.sessionService.refresh();
        console.log('✅ [Home] Datos actualizados');
      } else {
        console.log('ℹ️ [Home] Modo sin conexión activado');
        await Utils.showToast(
          'Está trabajando sin conexión',
          'middle'
        );
      }
    } catch (error) {
      console.error('❌ [Home] Error verificando estado:', error);
    }
  }

  async logout() {
    console.log('🚪 [Home] Iniciando proceso de logout...');
    try {
      console.log('🌐 [Home] Verificando conexión...');
      const isOnline = await this.sessionService.isOnline();
      console.log('📡 [Home] Estado de conexión:', isOnline ? 'En línea' : 'Sin conexión');

      if (isOnline) {
        console.log('🔄 [Home] Cerrando sesión...');
        await this.sessionService.close();
        console.log('✅ [Home] Sesión cerrada exitosamente');
      } else {
        console.log('ℹ️ [Home] Modo sin conexión, cerrando sesión local...');
        await this.sessionService.close();
      }

      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ [Home] Error en logout:', error);
        await Utils.showToast(
        'Error al cerrar sesión',
        'middle'
      );
    }
  }
}
