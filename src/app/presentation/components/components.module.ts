import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from '@ngx-translate/core';

import { ProcessAddComponent } from "./process-add/process-add.component";
import { ProcessApproveComponent } from "./process-approve/process-approve.component";
import { CardComponent } from "./card/card.component";
import { CardListComponent } from "./card-list/card-list.component";
import { HeaderComponent } from "./header/header.component";
import { LocationComponent } from "./location/location.component";
import { LocationSelectComponent } from "./location-select/location-select.component";
import { MaterialsComponent } from "./materials/materials.component";
import { MenuComponent } from "./menu/menu.component";
import { PackagesComponent } from "./packages/packages.component";
import { FacilityComponent } from "./facility/facility.component";
import { FacilitiesComponent } from "./facilities/facilities.component";
import { WastesComponent } from "./wastes/wastes.component";
import { SearchComponent } from "./search/search.component";
import { ServicesComponent } from "./services/services.component";
import { SignPadComponent } from "./sign-pad/sign-pad.component";
import { PartiesComponent } from "./parties/parties.component";
import { TaskAddComponent } from "./task-add/task-add.component";
import { TaskEditComponent } from "./task-edit/task-edit.component";
import { SubprocessApproveComponent } from "./subprocess-approve/subprocess-approve.component";
import { VehiclesComponent } from "./vehicles/vehicles.component";

@NgModule({
  declarations: [
    ProcessApproveComponent,
    CardComponent,
    CardListComponent,
    HeaderComponent,
    LocationComponent,
    LocationSelectComponent,
    MenuComponent,
    MaterialsComponent,
    PackagesComponent,
    FacilityComponent,
    FacilitiesComponent,
    WastesComponent,
    SearchComponent,
    ServicesComponent,
    SignPadComponent,
    PartiesComponent,
    TaskAddComponent,
    TaskEditComponent,
    SubprocessApproveComponent,
    VehiclesComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ProcessAddComponent,
  ],
  exports: [
    ProcessApproveComponent,
    CardComponent,
    CardListComponent,
    HeaderComponent,
    LocationComponent,
    LocationSelectComponent,
    MenuComponent,
    MaterialsComponent,
    PackagesComponent,
    FacilityComponent,
    FacilitiesComponent,
    WastesComponent,
    SearchComponent,
    ServicesComponent,
    SignPadComponent,
    PartiesComponent,
    TaskAddComponent,
    TaskEditComponent,
    SubprocessApproveComponent,
    VehiclesComponent,
    ProcessAddComponent,
  ],
})
export class ComponentsModule {}
