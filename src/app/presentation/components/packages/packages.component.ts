import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Embalaje } from '@app/domain/entities/embalaje.entity';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { PackagingService } from '@app/infrastructure/repositories/masterdata/packaging.repository';
import { Utils } from '@app/core/utils';
import { AuthorizationService } from '@app/infrastructure/repositories/masterdata/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  packages : Embalaje[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';
  enableNew: boolean = false;
  showNew: boolean = false;
  formData: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private packagingService: PackagingService,
    private authorizationService: AuthorizationService,
    private userNotificationService: UserNotificationService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    this.packages = await this.packagingService.list();
    this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_PACKAGE))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const packages = await this.packagingService.list();
    this.packages = packages.filter((package_) => package_.Nombre .toLowerCase().indexOf(query) > -1);
  }

  select(idEmbalaje: string) {
    this.selectedValue = idEmbalaje;
    this.modalCtrl.dismiss(this.selectedValue, 'confirm');
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  new() {
    this.showNew = true;
    this.formData.setValue({Nombre: null});
  }

  async create() {
    const formData = this.formData.value;
    const embalaje: Embalaje = { IdEmbalaje: Utils.generateId(), Nombre: formData.Nombre};
    const created = await this.packagingService.create(embalaje);
    if (created)
    {
      const data = {id: embalaje.IdEmbalaje, name: formData.Nombre};
      if (this.showHeader){
        this.modalCtrl.dismiss(data);
        this.selectedValue = embalaje.IdEmbalaje.toString();
      }
      else{
        this.packages = await this.packagingService.list();
        await this.userNotificationService.showToast(`Paquete ${formData.Nombre} creado`, 'middle');
        this.selectedValue = '';
        this.searchText = '';
      }
      this.formData.setValue({Nombre: null});
      this.showNew = false;
    }
  }
}
