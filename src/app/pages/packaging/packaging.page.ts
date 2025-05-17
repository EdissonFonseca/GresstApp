import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';

@Component({
  selector: 'app-packaging',
  templateUrl: './packaging.page.html',
  styleUrls: ['./packaging.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule]
})
export class PackagingPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
