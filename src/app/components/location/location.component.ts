import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent  implements OnInit {
  @Input() marker: any;

  constructor() { }

  ngOnInit() {}

}
