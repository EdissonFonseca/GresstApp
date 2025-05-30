import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, AlertController, NavController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuComponent } from './menu.component';
import { StorageService } from '@app/services/core/storage.service';
import { SessionService } from '@app/services/core/session.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { of } from 'rxjs';

const mockAccount = {
  IdPersona: '123',
  Nombre: 'Cuenta Test',
  NombreUsuario: 'usuario.test'
};

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let routerSpy: jasmine.SpyObj<Router>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let notificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(waitForAsync(() => {
    storageSpy = jasmine.createSpyObj('StorageService', ['get']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateRoot']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    menuCtrlSpy = jasmine.createSpyObj('MenuController', ['close']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['end', 'forceQuit']);
    notificationServiceSpy = jasmine.createSpyObj('UserNotificationService', [
      'showToast', 'showLoading', 'hideLoading', 'showAlert', 'showConfirm'
    ]);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);
    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      declarations: [MenuComponent],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        { provide: StorageService, useValue: storageSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MenuController, useValue: menuCtrlSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: UserNotificationService, useValue: notificationServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: TranslateService, useValue: translateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load user/account data', fakeAsync(async () => {
    storageSpy.get.and.returnValue(Promise.resolve(mockAccount));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve('C'));
    await component.ngOnInit();
    expect(component.account).toBe('Cuenta Test');
    expect(component.user).toBe('usuario.test');
    expect(component.idThirdParty).toBe('123');
    expect(component.debug).toBeTrue();
  }));

  it('should handle error on initialization', fakeAsync(async () => {
    storageSpy.get.and.returnValue(Promise.reject('Error'));
    translateSpy.instant.and.returnValue('Error');
    await component.ngOnInit();
    expect(notificationServiceSpy.showToast).toHaveBeenCalled();
  }));

  it('should set menu item visibility based on permissions', fakeAsync(async () => {
    storageSpy.get.and.returnValue(Promise.resolve(mockAccount));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve('C'));
    await component.ngOnInit();
    expect(component.showCertificate).toBeTrue();
    expect(component.showAccount).toBeTrue();
    expect(component.showPackage).toBeTrue();
    expect(component.showSupply).toBeTrue();
    expect(component.showMaterial).toBeTrue();
    expect(component.showService).toBeTrue();
    expect(component.showPoint).toBeTrue();
    expect(component.showThirdParty).toBeTrue();
    expect(component.showTreatment).toBeTrue();
    expect(component.showVehicle).toBeTrue();
  }));

  it('should hide menu item if permission is empty', fakeAsync(async () => {
    storageSpy.get.and.returnValue(Promise.resolve(mockAccount));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(''));
    await component.ngOnInit();
    expect(component.showCertificate).toBeFalse();
  }));

  it('should get initials from name', () => {
    expect(component.getInitials('Juan Perez')).toBe('JP');
    expect(component.getInitials('')).toBe('');
  });

  it('should navigate to points', () => {
    component.idThirdParty = '123';
    component.navigateToPoints();
    expect(menuCtrlSpy.close).toHaveBeenCalled();
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/points/123');
  });

  it('should handle error when navigating to points', () => {
    menuCtrlSpy.close.and.throwError('Error');
    translateSpy.instant.and.returnValue('Error');
    component.navigateToPoints();
    expect(notificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should navigate to a page', () => {
    component.navigateTo('profile');
    expect(menuCtrlSpy.close).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['profile']);
  });

  it('should handle error when navigating to a page', () => {
    menuCtrlSpy.close.and.throwError('Error');
    translateSpy.instant.and.returnValue('Error');
    component.navigateTo('profile');
    expect(notificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should navigate to synchronization page', async () => {
    await component.synchronize();
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/synchronization');
  });

  it('should handle error when navigating to synchronization', async () => {
    navCtrlSpy.navigateForward.and.throwError('Error');
    translateSpy.instant.and.returnValue('Error');
    await component.synchronize();
    expect(notificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should close the menu', () => {
    component.close();
    expect(menuCtrlSpy.close).toHaveBeenCalled();
  });

  it('should handle error when closing the menu', () => {
    menuCtrlSpy.close.and.throwError('Error');
    expect(() => component.close()).not.toThrow();
  });

  it('should logout and navigate to login on success', fakeAsync(async () => {
    notificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    sessionServiceSpy.end.and.returnValue(Promise.resolve(true));
    notificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    navCtrlSpy.navigateRoot.and.returnValue(Promise.resolve(true));
    await component.logout();
    expect(notificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.end).toHaveBeenCalled();
    expect(notificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  }));

  it('should show alert and force quit option if logout fails', fakeAsync(async () => {
    notificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    sessionServiceSpy.end.and.returnValue(Promise.resolve(false));
    notificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    notificationServiceSpy.showAlert.and.returnValue(Promise.resolve());
    await component.logout();
    expect(notificationServiceSpy.showAlert).toHaveBeenCalled();
    expect(component.showForceQuit).toBeTrue();
  }));

  it('should handle error during logout', fakeAsync(async () => {
    notificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    sessionServiceSpy.end.and.throwError('Error');
    notificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    translateSpy.instant.and.returnValue('Error');
    await component.logout();
    expect(notificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(notificationServiceSpy.showToast).toHaveBeenCalled();
  }));

  it('should force quit and navigate to login on confirm', fakeAsync(async () => {
    notificationServiceSpy.showConfirm.and.returnValue(Promise.resolve(true));
    notificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    sessionServiceSpy.forceQuit.and.returnValue(Promise.resolve());
    notificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    navCtrlSpy.navigateRoot.and.returnValue(Promise.resolve(true));
    await component.forceQuit();
    expect(notificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.forceQuit).toHaveBeenCalled();
    expect(notificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  }));

  it('should not force quit if not confirmed', fakeAsync(async () => {
    notificationServiceSpy.showConfirm.and.returnValue(Promise.resolve(false));
    await component.forceQuit();
    expect(sessionServiceSpy.forceQuit).not.toHaveBeenCalled();
  }));

  it('should handle error during force quit', fakeAsync(async () => {
    notificationServiceSpy.showConfirm.and.returnValue(Promise.resolve(true));
    notificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    sessionServiceSpy.forceQuit.and.throwError('Error');
    notificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    translateSpy.instant.and.returnValue('Error');
    await component.forceQuit();
    expect(notificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(notificationServiceSpy.showToast).toHaveBeenCalled();
  }));

  it('should render menu template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-menu')).toBeTruthy();
    expect(compiled.querySelector('ion-header')).toBeTruthy();
    expect(compiled.querySelector('ion-content')).toBeTruthy();
    expect(compiled.querySelector('ion-footer')).toBeTruthy();
    expect(compiled.querySelector('img.logo')).toBeTruthy();
  });
});
