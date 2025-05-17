import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { SessionService } from './session.service';
import { Router } from '@angular/router';

/**
 * Service responsible for managing application lifecycle events
 * and handling authentication state during app state changes
 */
@Injectable({
  providedIn: 'root'
})
export class AppLifecycleService {
  /** Tracks whether the app is currently in foreground */
  private isAppActive = true;
  /** Tracks whether the service is initialized */
  private isInitialized = false;
  /** Tracks whether we're currently handling a state change */
  private isHandlingStateChange = false;

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {
    this.initializeAppLifecycle();
  }

  /**
   * Initializes the app lifecycle listener to handle state changes
   * between foreground and background states
   */
  private initializeAppLifecycle(): void {
    App.addListener('appStateChange', async ({ isActive }) => {
      // Prevent multiple simultaneous state change handlers
      if (this.isHandlingStateChange) {
        return;
      }

      try {
        this.isHandlingStateChange = true;

        if (!isActive) {
          // App is going to background
          this.isAppActive = false;
        } else {
          // App is coming to foreground
          if (!this.isAppActive) {
            this.isAppActive = true;
            await this.handleAppResume();
          }
        }
      } catch (error) {
        console.error('Error handling app state change:', error);
      } finally {
        this.isHandlingStateChange = false;
      }
    });

    this.isInitialized = true;
  }

  /**
   * Handles app resume event by checking authentication state
   * and redirecting to login if session is invalid
   */
  private async handleAppResume(): Promise<void> {
    try {
      // Skip authentication check if we're already on the login page
      const currentUrl = this.router.url;
      if (currentUrl.includes('/login')) {
        return;
      }

      const isAuthenticated = await this.sessionService.isActive();
      if (!isAuthenticated) {
        // Redirect to login if session is invalid
        await this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }

  /**
   * Checks if the service is ready to handle state changes
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}
