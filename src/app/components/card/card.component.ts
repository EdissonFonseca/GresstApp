import { Component, EventEmitter, inject, Input, OnInit, output, Output, SimpleChanges } from '@angular/core';
import { Card } from '@app/interfaces/card';
import { Estado } from '@app/services/constants.service';
import { GlobalesService } from '@app/services/globales.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent  implements OnInit {
  @Input() card!: Card;
  @Input() showAction: boolean = true;
  @Output() edit = new EventEmitter<Card>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  constructor(
    private globales: GlobalesService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
  }

  onEdit(card: Card) {
    this.edit?.emit(card);
  }

  onApprove(id: string) {
    this.approve?.emit(id);
  }

  onReject(id: string) {
    this.reject?.emit(id);
  }

}
