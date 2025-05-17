import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationApiService } from './services/api/authenticationApi.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private auth: AuthenticationApiService,
    private router: Router,
    private platform: Platform) { }

    async initializeApp() {
      await this.platform.ready();
      await this.checkSession();
    }

    private async checkSession() {
      const loggedIn = await this.auth.isLoggedIn();
      if (!loggedIn) {
        await this.router.navigateByUrl('/login', { replaceUrl: true });
      } else {
        await this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    }
}
