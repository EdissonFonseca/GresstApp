import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Package } from '@app/domain/entities/package.entity';
import { PackageRepository } from '@app/infrastructure/repositories/package.repository';
import { EventEmitter, Output } from '@angular/core';
@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  @Output() packageSelected = new EventEmitter<{
    id: string;
    name: string;
  }>();
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
  ) {
    this.formData = this.formBuilder.group({
      Name: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.packages = await this.packageRepository.getAll();
    //this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_PACKAGE))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const packages = await this.packageRepository.getAll();
    this.packages = packages.filter((package_) => package_.Name .toLowerCase().indexOf(query) > -1);
  }

  select(packageId: string, name: string) {
    this.selectedValue = packageId;
    this.selectedName = name;
    const data = {
      id: this.selectedValue,
      name: this.selectedName,
    };
    this.packageSelected.emit(data);
    this.modalCtrl.dismiss(data);
}

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  new() {
    this.showNew = true;
    this.formData.setValue({Nombre: null});
  }

}
