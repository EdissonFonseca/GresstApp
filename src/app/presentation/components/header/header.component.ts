import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SynchronizationService } from '@app/infrastructure/services/synchronization.service';
import { SessionService } from '@app/application/services/session.service';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, interval } from 'rxjs';

/**
 * Component responsible for rendering the application header.
 * Provides synchronization status, help popup, and navigation controls.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  /** Title to be displayed in the header */
  @Input() pageTitle: string = 'Gresst';
  /** ID of the help popup to be displayed */
  @Input() helpPopup: string = '';
  /** Flag to track if the help popup is open */
  isOpen = false;
  /** Number of pending requests */
  pendingRequests = 0;
  /** Subscription to periodic updates */
  private updateSubscription: Subscription | undefined;

  constructor(
    public synchronizationService: SynchronizationService,
    private modalCtrl: ModalController,
    private sessionService: SessionService,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService
  ) { }

  /**
   * Lifecycle hook that is called after data-bound properties are initialized
   */
  ngOnInit() {
    // Update pending requests count every 2 seconds
    this.updateSubscription = interval(2000).subscribe(async () => {
      await this.sessionService.countPendingRequests();
      this.pendingRequests = this.synchronizationService.pendingTransactions();
    });
  }

  /**
   * Lifecycle hook that is called when the component is destroyed
   */
  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  /**
   * Synchronizes data with the server
   * Shows success or error message based on the result
   */
  async synchronize() {
    try {
      // Check if there are pending messages before attempting sync
      const hasPending = await this.sessionService.hasPendingRequests();

      await this.userNotificationService.showLoading(
        this.translate.instant('HEADER.MESSAGES.SYNCHRONIZING')
      );

      const success = await this.sessionService.synchronize();

      await this.userNotificationService.hideLoading();

      if (success) {
        // Update pending count after successful sync
        await this.sessionService.countPendingRequests();

        const message = hasPending
          ? this.translate.instant('HEADER.MESSAGES.SYNC_SUCCESS')
          : this.translate.instant('HEADER.MESSAGES.DATA_UPDATED');

        await this.userNotificationService.showToast(message, 'middle');
      } else {
        await this.userNotificationService.showToast(
          this.translate.instant('HEADER.MESSAGES.SYNC_ERROR'),
          'middle'
        );
      }
    } catch (error) {
      console.error('Error during synchronization:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('HEADER.MESSAGES.SYNC_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Returns the color for the sync icon based on pending transactions
   * @returns {string} 'danger' if there are pending transactions, 'success' otherwise
   */
  getColor(): string {
    try {
      return this.synchronizationService.pendingTransactions() > 0 ? 'danger' : 'success';
    } catch (error) {
      console.error('Error getting sync status color:', error);
      return 'success';
    }
  }

  /**
   * Shows the help popup if a helpPopup ID is provided
   * @throws {Error} If the help popup component is not found
   */
  async showHelp() {
    try {
      if (!this.helpPopup) {
        return;
      }

      const modal = await this.modalCtrl.create({
        component: 'app-help-popup',
        componentProps: {
          popupId: this.helpPopup
        }
      });

      await modal.present();
    } catch (error) {
      console.error('Error showing help popup:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('HEADER.MESSAGES.HELP_ERROR'),
        'middle'
      );
    }
  }
}
