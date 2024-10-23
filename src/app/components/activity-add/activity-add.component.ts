import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Estado, TipoServicio } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { PointsComponent } from '../points/points.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActividadesService } from 'src/app/services/actividades.service';

@Component({
  selector: 'app-activity-add',
  templateUrl: './activity-add.component.html',
  styleUrls: ['./activity-add.component.scss'],
})
export class ActivityAddComponent  implements OnInit {
  colorGeneracion: string = 'medium';
  colorEntrega: string = 'medium';
  colorRecepcion: string = 'medium';
  colorRecoleccion: string = 'primary';
  idServicio: string = '';
  idRecurso: string ='';
  recurso: string = '';
  unidadKilometraje: string = '';
  unidadCombustible: string = '';
  showFuel: boolean = true;
  showMileage: boolean = true;
  showTransport: boolean = false;
  showCollect: boolean = false;
  showProduce: boolean = false;
  frmActivity: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private globales: GlobalesService,
    private navParams: NavParams,
    private actividadesService: ActividadesService,
    private formBuilder: FormBuilder,
  ) {
    this.frmActivity = this.formBuilder.group({
      IdRecurso: ['', [Validators.required]]
    });
  }

  async ngOnInit() {
    this.idServicio = this.navParams.get('IdServicio');
    if (this.idServicio == TipoServicio.Transporte) {
      this.showTransport = true;
    }
    this.unidadCombustible = this.globales.unidadCombustible;
    this.unidadKilometraje = this.globales.unidadKilometraje;
  }

  async confirm() {
    const recurso: string = this.frmActivity.get('recurso')?.value;
    const now = new Date();
    const isoDate = now.toISOString();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isoToday = today.toISOString();
    let titulo: string = '';

    if (this.idServicio == TipoServicio.Transporte && this.idRecurso != ''){
      const lista = await this.actividadesService.list();
      const actividades = lista.filter(x => x.IdServicio == this.idServicio && x.IdRecurso == this.idRecurso && x.IdEstado == Estado.Pendiente);
      if (actividades.length > 0) {
        this.globales.presentToast('Ya existe un servicio activo para el vehiculo seleccionado', 'middle');
        this.idRecurso = '';
        this.recurso = '';
        return;
      } else {
        this.idServicio = TipoServicio.Transporte;
        titulo = this.idRecurso;
      }
    } else {
      titulo = recurso;
    }
    const actividad: Actividad = {
      IdActividad: this.globales.newId(),
      IdServicio: this.idServicio,
      IdRecurso: this.idRecurso,
      Titulo: titulo,
      FechaInicial: isoDate,
      FechaOrden: isoToday,
      IdEstado: Estado.Pendiente,
      NavegarPorTransaccion: true,
    };
    await this.actividadesService.create(actividad);

    this.modalCtrl.dismiss(actividad);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  changeService(serviceId: string) {
    this.idServicio = serviceId;
  }

  async selectVehicle() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: VehiclesComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idRecurso = data.data.id;
        this.recurso = data.data.name;
        this.frmActivity.patchValue({
          IdRecurso: data.data.id
        });
      }
    });

    return await modal.present();
   }

   async selectTarget() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        IdTercero: idTercero
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idRecurso = data.data.id;
        this.recurso = data.data.name;

        this.frmActivity.patchValue({
          IdRecurso: data.data.id
        });
      }
    });

    return await modal.present();
   }

   async selectSource() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idRecurso = data.data.id;
        this.recurso = data.data.name;

        this.frmActivity.patchValue({
          IdRecurso: data.data.id
        });
      }
    });

    return await modal.present();
   }
}
