import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SessionService } from '@app/services/core/session.service';
import { Utils } from '@app/utils/utils';

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
  ) { }

  ngOnInit() {}

  async synchronize() {
    await Utils.showLoading('Sincronizando...');
    try {
      const success = await this.sessionService.refresh();
      await Utils.hideLoading();

      if (success) {
        await Utils.showToast('Sincronización exitosa', "middle");
        this.navCtrl.navigateForward('/home');
      } else {
        await Utils.showToast('No hay conexión con el servidor. Intente de nuevo más tarde', "middle");
      }
    } catch (error) {
      await Utils.hideLoading();
      console.error('Error durante la sincronización:', error);
      await Utils.showToast('Error durante la sincronización. Intente de nuevo más tarde', "middle");
    }
  }
}
