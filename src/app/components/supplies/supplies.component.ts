import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Insumo } from '@app/interfaces/insumo.interface';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';
import { SuppliesService } from '@app/services/masterdata/supplies.service';
import { Utils } from '@app/utils/utils';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
@Component({
  selector: 'app-supplies',
  templateUrl: './supplies.component.html',
  styleUrls: ['./supplies.component.scss'],
})
export class SuppliesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  supplies : Insumo[] = [];
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
    private suppliesService: SuppliesService,
    private authorizationService: AuthorizationService,
    private userNotificationService: UserNotificationService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    this.supplies = await this.suppliesService.list();
    this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_SUPPLY))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const supplies = await this.suppliesService.list();
    this.supplies = supplies.filter((supply) => supply.Nombre .toLowerCase().indexOf(query) > -1);
  }

  select(idMaterial: string) {
    this.selectedValue = idMaterial;
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
    const insumo: Insumo = { IdInsumo: Utils.generateId(), Nombre: formData.Nombre, IdEstado: 'A'};
    const created = await this.suppliesService.create(insumo);
    if (created)
    {
      const data = {id: insumo.IdInsumo, name: formData.Nombre};
      if (this.showHeader){
        this.modalCtrl.dismiss(data);
        this.selectedValue = insumo.IdInsumo;
      }
      else{
        this.supplies = await this.suppliesService.list();
        await this.userNotificationService.showToast(`Insumo ${formData.Nombre} creado`, 'middle');
        this.selectedValue = '';
        this.searchText = '';
      }
      this.formData.setValue({Nombre: null});
      this.showNew = false;
    }
  }
}
