import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { SessionService } from './services/core/session.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let platformSpy: jasmine.SpyObj<Platform>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let splashScreenSpy: jasmine.SpyObj<typeof SplashScreen>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    platformSpy = jasmine.createSpyObj('Platform', ['ready'], {
      pause: { subscribe: jasmine.createSpy() },
      resume: { subscribe: jasmine.createSpy() },
      backButton: { subscribe: jasmine.createSpy() }
    });
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['isLoggedIn', 'isRefreshTokenValid']);
    splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: SplashScreen, useValue: splashScreenSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize app and navigate to home when logged in with valid token', fakeAsync(() => {
    platformSpy.ready.and.returnValue(Promise.resolve('core'));
    sessionServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.isRefreshTokenValid.and.returnValue(Promise.resolve(true));

    component.initializeApp();
    tick();

    expect(platformSpy.ready).toHaveBeenCalled();
    expect(splashScreenSpy.hide).toHaveBeenCalled();
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

  it('should set up platform events on init', () => {
    component.ngOnInit();

    expect(platformSpy.pause.subscribe).toHaveBeenCalled();
    expect(platformSpy.resume.subscribe).toHaveBeenCalled();
    expect(platformSpy.backButton.subscribe).toHaveBeenCalled();
  });

  it('should set up theme on init', () => {
    const mockMatchMedia = {
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener')
    };
    spyOn(window, 'matchMedia').and.returnValue(mockMatchMedia as any);
    spyOn(document.body.classList, 'toggle');

    component.ngOnInit();

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mockMatchMedia.addEventListener).toHaveBeenCalled();
  });
});
