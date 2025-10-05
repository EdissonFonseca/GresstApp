import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '@app/presentation/view-models/card.viewmodel';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent {
  @Input() cards: Card[] = [];
  @Input() allowNavigate: boolean = true;
  @Input() allowApprove: boolean = true;
  @Input() allowCustom: boolean = false;
  @Input() showEdit: boolean = true;
  @Output() edit = new EventEmitter<Card>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() custom =  new EventEmitter<string>();

  onEdit(card: Card) {
    this.edit.emit(card);
  }

  onApprove(id: string) {
    this.approve.emit(id);
  }

  onReject(id: string) {
    this.reject.emit(id);
  }

  onCustom(id: string) {
    this.custom.emit(id);
  }
}
