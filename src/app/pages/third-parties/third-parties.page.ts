import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';

@Component({
  selector: 'app-third-parties',
  templateUrl: './third-parties.page.html',
  styleUrls: ['./third-parties.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule, ComponentsModule]
})
export class ThirdPartiesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
