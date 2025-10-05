import { Component, OnInit } from '@angular/core';
import { TranslationService } from '@app/presentation/services/translation.service';

@Component({
  selector: 'app-language-selector',
  template: `
    <ion-item>
      <ion-label>{{ 'COMMON.LANGUAGE' | translate }}</ion-label>
      <ion-select [(ngModel)]="currentLanguage" (ionChange)="onLanguageChange($event)">
        <ion-select-option value="es">Español</ion-select-option>
        <ion-select-option value="en">English</ion-select-option>
      </ion-select>
    </ion-item>
  `
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: string;

  constructor(private translationService: TranslationService) {
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  ngOnInit() {}

  async onLanguageChange(event: any) {
    await this.translationService.setLanguage(event.detail.value);
  }
}
