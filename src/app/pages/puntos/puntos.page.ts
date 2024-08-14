import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-puntos',
  templateUrl: './puntos.page.html',
  styleUrls: ['./puntos.page.scss'],
})
export class PuntosPage implements OnInit {
  idTercero: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.idTercero = this.route.snapshot.paramMap.get('idTercero') || '';
  }

}
