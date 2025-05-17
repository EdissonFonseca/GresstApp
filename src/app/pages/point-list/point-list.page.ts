import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-point-list',
  templateUrl: './point-list.page.html',
  styleUrls: ['./point-list.page.scss'],
})
export class PointListPage implements OnInit {
  idTercero: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.idTercero = this.route.snapshot.paramMap.get('idTercero') || '';
  }
}
