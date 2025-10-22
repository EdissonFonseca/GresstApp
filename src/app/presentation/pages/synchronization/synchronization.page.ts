import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
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
  selector: 'app-synchronization',
  templateUrl: './synchronization.page.html',
  styleUrls: ['./synchronization.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class SynchronizationPage implements OnInit {
  pendingMessages = signal<number>(0);
  showExportOption = signal<boolean>(false);

  constructor(
    private navCtrl: NavController,
    private sessionService: SessionService,
    private userNotificationService: UserNotificationService,
    private messageRepository: MessageRepository,
    private storage: StorageService
  ) { }

  async ngOnInit() {
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
   * Attempt to synchronize data with the server
   */
  async synchronize() {
    await this.userNotificationService.showLoading('Sincronizando...');
    try {
      const success = await this.sessionService.synchronize();
      await this.userNotificationService.hideLoading();

      if (success) {
        await this.userNotificationService.showToast('Sincronización exitosa', "middle");
        await this.loadPendingMessages();
        this.showExportOption.set(false);
        this.navCtrl.navigateForward('/home');
      } else {
        await this.userNotificationService.showToast('No hay conexión con el servidor. Puede exportar los datos pendientes para enviarlos por correo.', "middle");
        this.showExportOption.set(true);
      }
    } catch (error) {
      await this.userNotificationService.hideLoading();
      console.error('Error durante la sincronización:', error);
      await this.userNotificationService.showToast('Error durante la sincronización. Puede exportar los datos pendientes.', "middle");
      this.showExportOption.set(true);
    }
  }

  /**
   * Export pending messages to a JSON file
   */
  async exportMessages() {
    try {
      await this.userNotificationService.showLoading('Generando archivo de exportación...');

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

      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        `Archivo exportado: ${fileName}. Puede enviarlo por correo a soporte.`,
        "top"
      );
    } catch (error) {
      await this.userNotificationService.hideLoading();
      console.error('Error exporting messages:', error);
      await this.userNotificationService.showToast('Error al exportar los datos', "middle");
    }
  }
}
