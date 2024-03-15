import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-residue-publish',
  templateUrl: './residue-publish.component.html',
  styleUrls: ['./residue-publish.component.scss'],
})
export class ResiduePublishComponent  implements OnInit {
  formData: FormGroup;
  date: Date | null = null;
  residueId: string;
  residue: Residuo | undefined ;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private formBuilder: FormBuilder,
    private globales: Globales,
  ) {
    //this.targets = this.navParams.get("targets");
    this.residueId = this.navParams.get("ResidueId");

    this.formData = this.formBuilder.group({
      Quantity: [],
      TargetId: []
    });
  }

  async ngOnInit() {
    this.residue = await this.globales.getResiduo(this.residueId);

    this.formData.patchValue({
      Quantity: this.residue?.Cantidad
    });
  }

  confirm() {

  }
  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  dateTimeChanged(event: any) {
    this.date = event.detail.value;
  }

}
