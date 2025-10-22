import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { SynchronizationService } from '@app/infrastructure/services/synchronization.service';
import { NavController } from '@ionic/angular';
import { Facility } from '@app/domain/entities/facility.entity';
import { Subprocess } from '@app/domain/entities/subprocess.entity';
import { INPUT_OUTPUT, STATUS, SERVICE_TYPES } from '@app/core/constants';
import { FacilityRepository } from '@app/infrastructure/repositories/facility.repository';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { Utils } from '@app/core/utils';
import { ComponentsModule } from '@app/presentation/components/components.module';

@Component({
  selector: 'app-facility-new',
  templateUrl: './facility-new.page.html',
  styleUrls: ['./facility-new.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule]
})
export class FacilityNewPage implements OnInit {
  puntos: Facility[] = [];
  idActividad: string = '';
  idPunto: string = '';
  punto: string = '';

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private subprocessesService: SubprocessService,
    private facilityRepository: FacilityRepository,
    private synchronizationService: SynchronizationService,
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad= params["IdActividad"]
    });
    this.idPunto = '';
    this.puntos = (await this.facilityRepository.getAll());
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    const puntos = await this.facilityRepository.getAll();
    this.puntos = puntos.filter((punto: Facility) => punto.Name.toLowerCase().indexOf(query) > -1);
  }

  select(idPunto: string, tercero: string, nombre: string) {
    this.idPunto = idPunto;
    this.punto = `${tercero} - ${nombre}`;
  }

   async confirm(){
    const transaccion: Subprocess = {
      Tasks: [],
      ProcessId: this.idActividad,
      SubprocessId: Utils.generateId(),
      ResourceId: "",
      ServiceId: SERVICE_TYPES.COLLECTION,
      StatusId: STATUS.PENDING,
      Title: '', // TODO
    };
    await this.subprocessesService.create(transaccion);

    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdActividad: this.idActividad
      }
    };
    this.navCtrl.navigateForward('/route', navigationExtras);


  }
}

