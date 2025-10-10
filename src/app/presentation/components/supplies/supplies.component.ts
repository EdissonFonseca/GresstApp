import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Supply } from '@app/domain/entities/supply.entity';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { SupplyRepository } from '@app/infrastructure/repositories/supply.repository';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
@Component({
  selector: 'app-supplies',
  templateUrl: './supplies.component.html',
  styleUrls: ['./supplies.component.scss'],
})
export class SuppliesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  supplies : Supply[] = [];
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
    private suppliesService: SupplyRepository,
    private authorizationService: AuthorizationRepository,
    private userNotificationService: UserNotificationService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    this.supplies = await this.suppliesService.getAll();
    this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_SUPPLY))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const supplies = await this.suppliesService.getAll();
    this.supplies = supplies.filter((supply) => supply.Name .toLowerCase().indexOf(query) > -1);
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
}
