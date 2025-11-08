import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '@app/domain/entities/account.entity';
import { STORAGE } from '@app/core/constants';

/**
 * Account page component
 * Displays and manages account information
 */
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
})
export class AccountPage implements OnInit {
  formData: FormGroup;
  account: Account | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private storage: Storage
  ) {
    this.formData = this.formBuilder.group({
      Name: ['', Validators.required],
      Identification: ['', Validators.required],
      Coverage: ['', Validators.required],
    });
  }

  /**
   * Initialize the page and load account data
   */
  async ngOnInit() {
    this.account = await this.storage.get(STORAGE.ACCOUNT);

    this.formData.patchValue({
      Nombre: this.account?.Name,
      Identificacion: this.account?.PersonId
    });
  }
}
