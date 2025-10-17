import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { ProcessAddComponent } from '@app/presentation/components/process-add/process-add.component';
import { ProcessApproveComponent } from '@app/presentation/components/process-approve/process-approve.component';
import { CardService } from '@app/presentation/services/card.service';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';

/**
 * ProcessesPage
 *
 * Page component for managing processes in the system.
 * Displays a list of processes with filtering and management capabilities.
 */
@Component({
  selector: 'app-processes',
  templateUrl: './processes.page.html',
  styleUrls: ['./processes.page.scss'],
})
export class ProcessesPage implements OnInit {
  /** Title of the page */
  title: string = '';
  /** Loading state */
  loading = signal(false);
  /** Flag indicating whether the add process button should be shown */
  showAdd: boolean = false;

  /** Signal containing the list of process cards (already sorted by CardService) */
  processCards = this.cardService.processes;

  constructor(
    private navCtrl: NavController,
    private cardService: CardService,
    private userNotificationService: UserNotificationService,
    private authorizationService: AuthorizationRepository,
    private translate: TranslateService,
    private modalCtrl: ModalController,
  ) {}

  /**
   * Initialize the page and load processes
   */
  async ngOnInit() {
    try {
      await this.loadData();
    } catch (error) {
      console.error('Error initializing processes page:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('PROCESSES.MESSAGES.INIT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Load data when the page is about to enter
   */
  async ionViewWillEnter() {
    await this.loadData();
  }

  /**
   * Load data for processes
   */
  async loadData() {
    try {
      this.loading.set(true);

      // Load all hierarchy data through CardService
      await this.cardService.loadAllHierarchy();

      this.showAdd = await this.authorizationService.allowAddActivity();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handle search input to filter processes
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    await this.loadData();
  }

  /**
   * Navigate back to the home page
   */
  goBack() {
    this.navCtrl.navigateBack('/home');
  }

  /**
   * Navigate to subprocesses page for a specific process
   * @param process - The process card to navigate to
   */
  navigateToTransactions(process: Card) {
    try {
      const navigationExtras: NavigationExtras = {
        queryParams: { processId: process.id },
      };
      this.navCtrl.navigateForward('/subprocesses', navigationExtras);
    } catch (error) {
      console.error('Error navigating to transactions:', error);
      this.userNotificationService.showToast(
        this.translate.instant('PROCESSES.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Navigate to map page for the current process
   */
  navigateToMap() {
    try {
      const firstProcess = this.processCards()[0];
      const navigationExtras: NavigationExtras = {
        queryParams: {
          processId: firstProcess?.id,
        }
      };
      this.navCtrl.navigateForward('/route', navigationExtras);
    } catch (error) {
      console.error('Error navigating to map:', error);
      this.userNotificationService.showToast(
        this.translate.instant('PROCESSES.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the add process modal
   * @param serviceType - The service type for the new process
   */
  async openAdd(serviceType: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: ProcessAddComponent,
        componentProps: {
          IdServicio: serviceType
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('PROCESSES.MESSAGES.UPDATING_INFO'));
        await this.loadData();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error opening add modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('PROCESSES.MESSAGES.ADD_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the approve process modal
   * @param id - The ID of the process to approve
   */
  async openApprove(id: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: ProcessApproveComponent,
        componentProps: {
          processId: id,
          isReject: false
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('PROCESSES.MESSAGES.UPDATING_INFO'));
        await this.loadData();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error opening approve modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('PROCESSES.MESSAGES.APPROVE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the reject process modal
   * @param id - The ID of the process to reject
   */
  async openReject(id: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: ProcessApproveComponent,
        componentProps: {
          processId: id,
          isReject: true
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('PROCESSES.MESSAGES.UPDATING_INFO'));
        await this.loadData();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error opening reject modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('PROCESSES.MESSAGES.REJECT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Synchronize processes with the server
   */
  async synchronize() {
    try {
      await this.userNotificationService.showLoading(this.translate.instant('PROCESSES.MESSAGES.SYNCHRONIZING'));
      // Add synchronization logic here
      await this.loadData();
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('PROCESSES.MESSAGES.SYNC_SUCCESS'),
        'middle'
      );
    } catch (error) {
      console.error('Error synchronizing:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('PROCESSES.MESSAGES.SYNC_ERROR'),
        'middle'
      );
    }
  }
}
