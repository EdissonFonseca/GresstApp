import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: false
})
export class SearchComponent  implements OnInit {

  constructor(private modal:ModalController) { }

  ngOnInit() {}

  cancelSearch() {
    this.modal.dismiss(null, 'cancel');
  }

  confirmSearch() {
    this.modal.dismiss(null, 'confirm');
  }
}
