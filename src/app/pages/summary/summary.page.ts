import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CardService } from '@app/services/core/card.service';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { Card } from '@app/interfaces/card.interface';

/**
 * Page component for summary view
 * Displays a summary of activities, transactions, and tasks
 */
@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {
  cards: Card[] = [];

  constructor(
    private navCtrl: NavController,
    private cardService: CardService,
    private activitiesService: ActivitiesService,
    private transactionsService: TransactionsService
  ) { }

  /**
   * Initialize the page and load activities
   */
  async ngOnInit() {
    try {
      this.cards = await this.cardService.mapActividades([]);
    } catch (error) {
      console.error('❌ Error loading activities:', error);
      this.cards = [];
    }
  }

  /**
   * Handle card click event
   * Navigate to appropriate page based on card type
   * @param card The clicked card
   */
  onCardClick(card: Card) {
    switch (card.type) {
      case 'activity':
        this.navCtrl.navigateForward('/activities', {
          state: { activity: card }
        });
        break;
      case 'transaction':
        this.navCtrl.navigateForward('/transactions', {
          state: { activity: card }
        });
        break;
      case 'task':
        this.navCtrl.navigateForward('/tasks', {
          state: { activity: card }
        });
        break;
    }
  }

  /**
   * Handle pull-to-refresh event
   * Reload activities
   * @param event The refresh event
   */
  async doRefresh(event: any) {
    try {
      this.cards = await this.cardService.mapActividades([]);
    } catch (error) {
      console.error('❌ Error refreshing activities:', error);
    } finally {
      event.target.complete();
    }
  }
}
