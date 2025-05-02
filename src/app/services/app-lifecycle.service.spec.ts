import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppLifecycleService } from './app-lifecycle.service';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { App, AppState } from '@capacitor/app';

describe('AppLifecycleService', () => {
  let service: AppLifecycleService;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let appListenerCallback: ((state: AppState) => void) | null = null;

  beforeEach(async () => {
    // Create spies for dependent services
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Mock App.addListener
    const mockListener = {
      remove: () => Promise.resolve()
    };

    // @ts-expect-error - Capacitor types are not properly defined for testing
    spyOn(App, 'addListener').and.callFake((eventName: string, callback: any) => {
      if (eventName === 'appStateChange') {
        appListenerCallback = callback;
      }
      return Promise.resolve(mockListener);
    });

    TestBed.configureTestingModule({
      providers: [
        AppLifecycleService,
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AppLifecycleService);
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize app lifecycle listener', () => {
      // @ts-expect-error - Capacitor types are not properly defined for testing
      expect(App.addListener).toHaveBeenCalledWith('appStateChange', jasmine.any(Function));
      expect(appListenerCallback).toBeTruthy('Callback should be registered');
    });
  });

  describe('App State Changes', () => {
    it('should handle app going to background', fakeAsync(() => {
      expect(appListenerCallback).toBeTruthy('Callback should be registered');
      if (appListenerCallback) {
        // Simulate app going to background
        appListenerCallback({ isActive: false });
        tick();

        // Verify state is updated correctly
        expect(service['isAppActive']).toBeFalse();
      }
    }));

    it('should handle app coming to foreground with valid session', fakeAsync(() => {
      // Configure spy to simulate valid session
      authServiceSpy.isAuthenticated.and.returnValue(Promise.resolve(true));

      expect(appListenerCallback).toBeTruthy('Callback should be registered');
      if (appListenerCallback) {
        // First put app in background
        appListenerCallback({ isActive: false });
        tick();
        expect(service['isAppActive']).toBeFalse();

        // Then bring app to foreground
        appListenerCallback({ isActive: true });
        tick();

        // Verify authentication was checked
        expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
        // Verify NO redirect to login
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      }
    }));

    it('should handle app coming to foreground with invalid session', fakeAsync(() => {
      // Configure spy to simulate invalid session
      authServiceSpy.isAuthenticated.and.returnValue(Promise.resolve(false));

      expect(appListenerCallback).toBeTruthy('Callback should be registered');
      if (appListenerCallback) {
        // First put app in background
        appListenerCallback({ isActive: false });
        tick();
        expect(service['isAppActive']).toBeFalse();

        // Then bring app to foreground
        appListenerCallback({ isActive: true });
        tick();

        // Verify authentication was checked
        expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
        // Verify redirect to login
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      }
    }));
  });

  describe('Error Handling', () => {
    it('should handle authentication check error', fakeAsync(() => {
      // Configure spy to simulate error
      authServiceSpy.isAuthenticated.and.returnValue(Promise.reject(new Error('Test error')));

      expect(appListenerCallback).toBeTruthy('Callback should be registered');
      if (appListenerCallback) {
        // First put app in background
        appListenerCallback({ isActive: false });
        tick();
        expect(service['isAppActive']).toBeFalse();

        // Then bring app to foreground
        appListenerCallback({ isActive: true });
        tick();

        // Verify authentication was checked
        expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
        // Verify redirect to login on error
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      }
    }));
  });

  describe('Edge Cases', () => {
    it('should not handle app resume if already active', fakeAsync(() => {
      // Simulate app is already active
      service['isAppActive'] = true;

      expect(appListenerCallback).toBeTruthy('Callback should be registered');
      if (appListenerCallback) {
        // Try to bring app to foreground when already active
        appListenerCallback({ isActive: true });
        tick();

        // Verify authentication was NOT checked
        expect(authServiceSpy.isAuthenticated).not.toHaveBeenCalled();
        // Verify NO redirect to login
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      }
    }));
  });
});
