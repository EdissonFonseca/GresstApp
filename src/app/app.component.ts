import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      await this.platform.ready();
      await SplashScreen.hide();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  ngOnInit() {
    this.setupPlatformEvents();
    this.setupTheme();
  }

  private setupPlatformEvents() {
    this.platform.pause.subscribe(() => {
      // Handle app pause
    });

    this.platform.resume.subscribe(() => {
      // Handle app resume
    });

    this.platform.backButton.subscribe(() => {
      // Handle back button
    });
  }

  private setupTheme() {
    // Check for system dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => {
      this.toggleDarkTheme(mediaQuery.matches);
    });
  }

  private toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle('dark-theme', shouldAdd);
  }
}
