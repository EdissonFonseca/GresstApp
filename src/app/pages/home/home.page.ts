import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @Input() title = 'Jornada';
  @Input() helpPopup = 'help-inventario';
  nombreCuenta: string = '';
  nombreUsuario: string = '';

  constructor(
  ) {}

  async ngOnInit() {
  }

  setHeader(title: string, helpPopup: string){
    this.title = title;
    this.helpPopup = helpPopup;
  }
}
