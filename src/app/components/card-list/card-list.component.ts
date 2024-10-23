import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from '@app/interfaces/card';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
})
export class CardListComponent  implements OnInit {
  @Input() cards: Card[] | null  = [];
  @Input() selectedId: string = '';
  @Output() edit = new EventEmitter<Card>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {}

  onEdit(card: Card) {
    this.edit.emit(card);
  }

  onApprove(id: string) {
    this.approve.emit(id);
  }

  onReject(id: string) {
    this.reject.emit(id);
  }
}
