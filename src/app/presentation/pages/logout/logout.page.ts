import { Component, OnInit, signal } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '@app/application/services/session.service';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { MessageRepository } from '@app/infrastructure/repositories/message.repository';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface BackupData {
  timestamp: string;
  requests: any[];
}

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
  standalone: false
})
export class LogoutPage implements OnInit {
  pendingMessages = signal<number>(0);
  showExportOption = signal<boolean>(false);
  canCancel: boolean = false;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private userNotificationService: UserNotificationService,
    private messageRepository: MessageRepository,
    private storage: StorageService
  ) { }

  async ngOnInit() {
    // Check if the page was called with canCancel parameter
    this.route.queryParams.subscribe(params => {
      this.canCancel = params['canCancel'] === 'true';
    });

    await this.loadPendingMessages();
  }

  /**
   * Load count of pending messages
   */
  async loadPendingMessages() {
    try {
      const messages = await this.messageRepository.get();
      this.pendingMessages.set(messages?.length || 0);
    } catch (error) {
      console.error('Error loading pending messages:', error);
      this.pendingMessages.set(0);
    }
  }

  /**
   * Attempt to end session and logout
   * Tries to upload pending data before closing session
   */
  async logout() {
    await this.userNotificationService.showLoading('Cerrando sesión y sincronizando datos...');
    try {
      const success = await this.sessionService.end();
      await this.userNotificationService.hideLoading();

      if (success) {
        // Session ended successfully, storage cleared, navigate to login
        await this.userNotificationService.showToast('Sesión cerrada exitosamente', "middle");
        this.navCtrl.navigateRoot('/login');
      } else {
        // Failed to upload pending data
        await this.userNotificationService.showToast(
          'No se pudo sincronizar con el servidor. Tiene datos pendientes por enviar.',
          "middle"
        );
        this.showExportOption.set(true);
      }
    } catch (error) {
      await this.userNotificationService.hideLoading();
      console.error('Error cerrando sesión:', error);
      await this.userNotificationService.showToast(
        'Error al cerrar sesión. Puede exportar los datos pendientes.',
        "middle"
      );
      this.showExportOption.set(true);
    }
  }

  /**
   * Force quit - export data and clear session
   * Automatically generates backup and closes session
   */
  async forceQuit() {
    try {
      const pendingCount = this.pendingMessages();

      // First, export pending messages if there are any
      if (pendingCount > 0) {
        await this.userNotificationService.showLoading('Generando backup de datos pendientes...');
        try {
          await this.exportMessagesInternal();
          await this.userNotificationService.hideLoading();
        } catch (error) {
          console.error('Error exporting messages during force quit:', error);
          await this.userNotificationService.hideLoading();
          await this.userNotificationService.showToast(
            'Error al generar el backup. No se puede continuar con el cierre.',
            "middle"
          );
          return;
        }
      }

      // Then clear storage and logout
      await this.userNotificationService.showLoading('Cerrando sesión...');
      await this.sessionService.forceQuit();
      await this.userNotificationService.hideLoading();

      const message = pendingCount > 0
        ? 'Backup generado. Sesión cerrada.'
        : 'Sesión cerrada.';

      await this.userNotificationService.showToast(message, "middle");
      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      await this.userNotificationService.hideLoading();
      console.error('Error during force quit:', error);
      await this.userNotificationService.showToast('Error al forzar cierre', "middle");
    }
  }

  /**
   * Internal method to export messages without showing loading/toast
   * Used by forceQuit to avoid duplicate notifications
   */
  private async exportMessagesInternal(): Promise<void> {
    // Get pending messages
    const requests = await this.storage.get(STORAGE.MESSAGES);

    // Create backup data object
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      requests: requests || []
    };

    // Convert to JSON
    const jsonData = JSON.stringify(backupData, null, 2);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `gresst-datos-pendientes-${timestamp}.json`;

    // In browser environment, create a downloadable link
    if (typeof window !== 'undefined') {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    // Also try to save to device storage
    try {
      const base64Data = btoa(jsonData);
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
    } catch (fsError) {
      console.log('Could not save to filesystem (probably in browser):', fsError);
    }
  }


  /**
   * Cancel logout and return to home
   */
  cancel() {
    this.navCtrl.navigateBack('/home');
  }
}

