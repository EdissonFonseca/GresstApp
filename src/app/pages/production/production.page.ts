import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-production',
  templateUrl: './production.page.html',
  styleUrls: ['./production.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ProductionPage implements OnInit {
  transacciones: Tarea[] = [];
  idServicio?: number = undefined;
  idActividad: string = '';
  titulo: string = '';
  proceso: string = '';
  icono: string = '';
  currentLocation: any;
  coordinates: string = '';
  idEstado: string = 'P';
  @ViewChild(IonModal) modal!: IonModal;

  constructor() { }

  ngOnInit() {
  }
}
