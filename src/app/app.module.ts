import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StorageService } from './infrastructure/repositories/api/storage.repository';
import { TranslateService } from '@ngx-translate/core';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideAnimationsAsync(),
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
