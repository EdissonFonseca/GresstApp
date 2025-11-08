import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { StorageService } from './infrastructure/services/storage.service';
import { TranslateService } from '@ngx-translate/core';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    TranslateModule.forRoot()
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    }),
    StorageService,
    TranslateService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private translate: TranslateService,
    private storage: StorageService
  ) {
    this.initializeApp();
  }

  private async initializeApp() {
    try {
      // Initialize translations
      this.translate.setDefaultLang('es');
      await this.translate.use('es').toPromise();

      // Initialize storage
      await this.storage.init();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
}
