import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Package } from '@app/domain/entities/package.entity';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { PackageRepository } from '@app/infrastructure/repositories/package.repository';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  packages : Package[] = [];
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
    private packageRepository: PackageRepository,
    private authorizationService: AuthorizationRepository,
    private userNotificationService: UserNotificationService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    this.packages = await this.packageRepository.getAll();
    this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_PACKAGE))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const packages = await this.packageRepository.getAll();
    this.packages = packages.filter((package_) => package_.Name .toLowerCase().indexOf(query) > -1);
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

}
