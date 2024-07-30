import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { Tarea } from 'src/app/interfaces/tarea.interface';

@Component({
  selector: 'app-produccion',
  templateUrl: './produccion.page.html',
  styleUrls: ['./produccion.page.scss'],
})
export class ProduccionPage implements OnInit {
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
