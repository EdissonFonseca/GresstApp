import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ActivityAddComponent } from "./activity-add/activity-add.component";
import { ActivityApproveComponent } from "./activity-approve/activity-approve.component";
import { ActivityRejectComponent } from "./activity-reject/activity-reject.component";
import { HeaderComponent } from "./header/header.component";
import { LocationComponent } from "./location/location.component";
import { LocationSelectComponent } from "./location-select/location-select.component";
import { MaterialsComponent } from "./materials/materials.component";
import { MenuComponent } from "./menu/menu.component";
import { PackagesComponent } from "./packages/packages.component";
import { PointComponent } from "./point/point.component";
import { PointsComponent } from "./points/points.component";
import { ResidueDismissComponent } from "./residue-dismiss/residue-dismiss.component";
import { ResidueMoveComponent } from "./residue-move/residue-move.component";
import { ResiduePublishComponent } from "./residue-publish/residue-publish.component";
import { ResidueReceiveComponent } from "./residue-receive/residue-receive.component";
import { ResidueTransferComponent } from "./residue-transfer/residue-transfer.component";
import { ResidueTransformComponent } from "./residue-transform/residue-transform.component";
import { ResiduesComponent } from "./residues/residues.component";
import { SearchComponent } from "./search/search.component";
import { ServicesComponent } from "./services/services.component";
import { SignPadComponent } from "./sign-pad/sign-pad.component";
import { StakeholdersComponent } from "./stakeholders/stakeholders.component";
import { SuppliesComponent } from "./supplies/supplies.component";
import { TaskAddComponent } from "./task-add/task-add.component";
import { TaskApproveComponent } from "./task-approve/task-approve.component";
import { TaskRejectComponent } from "./task-reject/task-reject.component";
import { TransactionApproveComponent } from "./transaction-approve/transaction-approve.component";
import { TransactionRejectComponent } from "./transaction-reject/transaction-reject.component";
import { TreatmentsComponent } from "./treatments/treatments.component";
import { VehiclesComponent } from "./vehicles/vehicles.component";

const components = [];

@NgModule({
  declarations: [ ActivityAddComponent, ActivityApproveComponent, ActivityRejectComponent, HeaderComponent, LocationComponent, LocationSelectComponent, MaterialsComponent, MenuComponent, PackagesComponent, PointComponent, PointsComponent, ResidueDismissComponent, ResidueMoveComponent, ResiduePublishComponent, ResidueReceiveComponent, ResidueTransferComponent, ResidueTransformComponent, ResiduesComponent, SearchComponent, ServicesComponent, SignPadComponent, StakeholdersComponent, SuppliesComponent, TaskAddComponent, TaskApproveComponent, TaskRejectComponent, TransactionApproveComponent, TransactionRejectComponent, TreatmentsComponent, VehiclesComponent],
  imports:      [ CommonModule, IonicModule, FormsModule, ReactiveFormsModule ],
  exports:      [ ActivityAddComponent, ActivityApproveComponent, ActivityRejectComponent, HeaderComponent, LocationComponent, LocationSelectComponent, MaterialsComponent, MenuComponent, PackagesComponent, PointComponent, PointsComponent, ResidueDismissComponent, ResidueMoveComponent, ResiduePublishComponent, ResidueReceiveComponent, ResidueTransferComponent, ResidueTransformComponent, ResiduesComponent, SearchComponent, ServicesComponent, SignPadComponent, StakeholdersComponent, SuppliesComponent, TaskAddComponent, TaskApproveComponent, TaskRejectComponent, TransactionApproveComponent, TransactionRejectComponent, TreatmentsComponent, VehiclesComponent],
})
export class ComponentsModule {}
