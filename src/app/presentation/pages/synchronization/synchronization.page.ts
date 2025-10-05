import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SessionService } from '@app/infrastructure/services/session.service';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
@Component({
  selector: 'app-synchronization',
  templateUrl: './synchronization.page.html',
  styleUrls: ['./synchronization.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class SynchronizationPage implements OnInit {
  constructor(
    private navCtrl: NavController,
    private sessionService: SessionService,
    private userNotificationService: UserNotificationService
  ) { }

  ngOnInit() {}

  async synchronize() {
    await this.userNotificationService.showLoading('Sincronizando...');
    try {
      const success = await this.sessionService.synchronize();
      await this.userNotificationService.hideLoading();

      if (success) {
        await this.userNotificationService.showToast('Sincronización exitosa', "middle");
        this.navCtrl.navigateForward('/home');
      } else {
        await this.userNotificationService.showToast('No hay conexión con el servidor. Intente de nuevo más tarde', "middle");
      }
    } catch (error) {
      await this.userNotificationService.hideLoading();
      console.error('Error durante la sincronización:', error);
      await this.userNotificationService.showToast('Error durante la sincronización. Intente de nuevo más tarde', "middle");
    }
  }
}
