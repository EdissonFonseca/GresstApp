import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from '@app/interfaces/card.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card!: Card;
  @Input() allowNavigate: boolean = true;
  @Input() allowApprove: boolean = true;

  @Output() edit = new EventEmitter<Card>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() custom = new EventEmitter<string>();

  constructor() { }

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
