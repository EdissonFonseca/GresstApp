import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { SessionService } from './infrastructure/services/session.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let platformSpy: jasmine.SpyObj<Platform>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    platformSpy = jasmine.createSpyObj('Platform', ['ready'], {
      pause: { subscribe: jasmine.createSpy() },
      resume: { subscribe: jasmine.createSpy() },
      backButton: { subscribe: jasmine.createSpy() }
    });
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['isLoggedIn', 'isRefreshTokenValid']);

    // Mock SplashScreen static method
    spyOn(SplashScreen, 'hide').and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: SessionService, useValue: sessionServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('initializeApp', () => {
    it('should initialize app and navigate to home when logged in with valid token', fakeAsync(() => {
      platformSpy.ready.and.returnValue(Promise.resolve('core'));
      sessionServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(true));
      sessionServiceSpy.isRefreshTokenValid.and.returnValue(Promise.resolve(true));

      component.initializeApp();
      tick();

      expect(platformSpy.ready).toHaveBeenCalled();
      expect(SplashScreen.hide).toHaveBeenCalled();
      expect(sessionServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(sessionServiceSpy.isRefreshTokenValid).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should navigate to login when not logged in', fakeAsync(() => {
      platformSpy.ready.and.returnValue(Promise.resolve('core'));
      sessionServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(false));

      component.initializeApp();
      tick();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should navigate to login when token is invalid', fakeAsync(() => {
      platformSpy.ready.and.returnValue(Promise.resolve('core'));
      sessionServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(true));
      sessionServiceSpy.isRefreshTokenValid.and.returnValue(Promise.resolve(false));

      component.initializeApp();
      tick();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should handle initialization error and navigate to login', fakeAsync(() => {
      platformSpy.ready.and.returnValue(Promise.reject('Error'));
      spyOn(console, 'error');

      component.initializeApp();
      tick();

      expect(console.error).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('ngOnInit', () => {
    it('should set up platform events and theme on initialization', () => {
      const setupPlatformEventsSpy = spyOn<any>(component, 'setupPlatformEvents');
      const setupThemeSpy = spyOn<any>(component, 'setupTheme');

      component.ngOnInit();

      expect(setupPlatformEventsSpy).toHaveBeenCalled();
      expect(setupThemeSpy).toHaveBeenCalled();
    });
  });

  describe('Platform Events', () => {
    it('should set up platform event subscriptions', () => {
      component['setupPlatformEvents']();

      expect(platformSpy.pause.subscribe).toHaveBeenCalled();
      expect(platformSpy.resume.subscribe).toHaveBeenCalled();
      expect(platformSpy.backButton.subscribe).toHaveBeenCalled();
    });
  });

  describe('Theme Setup', () => {
    let matchMediaSpy: jasmine.SpyObj<MediaQueryList>;
    let addEventListenerSpy: jasmine.Spy;

    beforeEach(() => {
      matchMediaSpy = jasmine.createSpyObj('MediaQueryList', ['addEventListener'], {
        matches: false
      });
      addEventListenerSpy = jasmine.createSpy('addEventListener');
      matchMediaSpy.addEventListener = addEventListenerSpy;
      spyOn(window, 'matchMedia').and.returnValue(matchMediaSpy);
    });

    it('should set up theme based on system preference', () => {
      const toggleDarkThemeSpy = spyOn<any>(component, 'toggleDarkTheme');
      Object.defineProperty(matchMediaSpy, 'matches', { value: true });

      component['setupTheme']();

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(toggleDarkThemeSpy).toHaveBeenCalledWith(true);
      expect(addEventListenerSpy).toHaveBeenCalled();
    });

    it('should toggle dark theme class on body', () => {
      const bodyClassListSpy = spyOn(document.body.classList, 'toggle');

      component['toggleDarkTheme'](true);

      expect(bodyClassListSpy).toHaveBeenCalledWith('dark-theme', true);
    });
  });
});
