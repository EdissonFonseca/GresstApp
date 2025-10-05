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
import { PointComponent } from "./point/point.component";
import { PointsComponent } from "./points/points.component";
import { ResiduesComponent } from "./residues/residues.component";
import { SearchComponent } from "./search/search.component";
import { ServicesComponent } from "./services/services.component";
import { SignPadComponent } from "./sign-pad/sign-pad.component";
import { StakeholdersComponent } from "./stakeholders/stakeholders.component";
import { SuppliesComponent } from "./supplies/supplies.component";
import { TaskAddComponent } from "./task-add/task-add.component";
import { TaskEditComponent } from "./task-edit/task-edit.component";
import { TransactionApproveComponent } from "./transaction-approve/transaction-approve.component";
import { TreatmentsComponent } from "./treatments/treatments.component";
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
    PointComponent,
    PointsComponent,
    ResiduesComponent,
    SearchComponent,
    ServicesComponent,
    SignPadComponent,
    StakeholdersComponent,
    SuppliesComponent,
    TaskAddComponent,
    TaskEditComponent,
    TransactionApproveComponent,
    TreatmentsComponent,
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
    PointComponent,
    PointsComponent,
    ResiduesComponent,
    SearchComponent,
    ServicesComponent,
    SignPadComponent,
    StakeholdersComponent,
    SuppliesComponent,
    TaskAddComponent,
    TaskEditComponent,
    TransactionApproveComponent,
    TreatmentsComponent,
    VehiclesComponent,
    ProcessAddComponent,
  ],
})
export class ComponentsModule {}
