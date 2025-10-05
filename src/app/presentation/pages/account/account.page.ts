import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cuenta } from '@app/domain/entities/cuenta.entity';
import { STORAGE } from '@app/core/constants';

/**
 * Account page component
 * Displays and manages account information
 */
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  formData: FormGroup;
  cuenta: Cuenta | undefined;

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private storage: Storage
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Identificacion: ['', Validators.required],
      Cubrimiento: ['', Validators.required],
    });
  }

  /**
   * Initialize the page and load account data
   */
  async ngOnInit() {
    this.cuenta = await this.storage.get(STORAGE.ACCOUNT);

    this.formData.patchValue({
      Nombre: this.cuenta?.NombreCuenta,
      Identificacion: this.cuenta?.IdPersonaCuenta
    });
  }
}
