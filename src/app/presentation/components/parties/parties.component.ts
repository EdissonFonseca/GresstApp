import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { ModalController, NavController } from '@ionic/angular';
import { Party } from '@app/domain/entities/party.entity';
import { PartyRepository } from '@app/infrastructure/repositories/party.repository';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
@Component({
  selector: 'app-parties',
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.scss'],
})
export class PartiesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  terceros: Party[] = [];
  formData: FormGroup;
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';
  enableNew: boolean = false;
  showNew: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private partyRepository: PartyRepository,
    private navCtrl: NavController,
    private authorizationService: AuthorizationRepository,
    private userNotificationService: UserNotificationService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Identificacion: ['', Validators.required],
      Telefono: [''],
      Correo: [''],
    });
  }

  async ngOnInit() {
    this.terceros = await this.partyRepository.getAll();
    this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_THIRD_PARTY))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();
    this.formData.patchValue({Nombre: this.selectedName});

    const tercerosList = await this.partyRepository.getAll();
    this.terceros = tercerosList.filter((tercero) => tercero.Name?.toLowerCase().indexOf(query) > -1);
  }

  select(idTercero: string, nombre: string) {
    this.selectedValue = idTercero;
    this.selectedName = nombre;
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  search() {
    this.showNew = false;
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  new() {
    this.showNew = true;
    this.formData.setValue({Nombre: null, Identificacion: null, Telefono: null, Correo:null });
  }


  goToPuntos(idTercero: string) {
    this.navCtrl.navigateForward(`/puntos/${idTercero}`);
  }
}

