import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, IonTabs, Platform, NavController, Config } from '@ionic/angular';
import { HomePage } from './home.page';
import { SessionService } from '@app/services/core/session.service';
import { ComponentsModule } from '@app/components/components.module';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from '@app/services/core/storage.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { STORAGE } from '@app/constants/constants';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Storage } from '@ionic/storage-angular';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { AuthorizationApiService } from '@app/services/api/authorizationApi.service';
import { EventEmitter } from '@angular/core';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let storageSpy: jasmine.SpyObj<Storage>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let authApiServiceSpy: jasmine.SpyObj<AuthorizationApiService>;
  let platformSpy: jasmine.SpyObj<Platform>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let configSpy: jasmine.SpyObj<Config>;

  beforeEach(async () => {
    const sessionSpy = jasmine.createSpyObj('SessionService', ['countPendingRequests', 'pendingRequests']);
    const storageServiceSpyObj = jasmine.createSpyObj('StorageService', ['get']);
    const notificationSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const storageSpyObj = jasmine.createSpyObj('Storage', ['create', 'get', 'set']);
    const syncSpy = jasmine.createSpyObj('SynchronizationService', ['sync']);
    const authApiSpy = jasmine.createSpyObj('AuthorizationApiService', ['get']);
    const platformSpyObj = jasmine.createSpyObj('Platform', ['ready', 'is']);
    const navControllerSpyObj = jasmine.createSpyObj('NavController', ['navigateRoot', 'navigateForward', 'navigateBack']);
    const configSpyObj = jasmine.createSpyObj('Config', ['get']);

    // Mock IonTabs
    const mockIonTabs = {
      ionTabsDidChange: new EventEmitter<any>(),
      getSelected: () => 'activities'
    };

    await TestBed.configureTestingModule({
      imports: [
        HomePage,
        CommonModule,
        IonicModule.forRoot({
          mode: 'ios'
        }),
        ComponentsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SessionService, useValue: sessionSpy },
        { provide: StorageService, useValue: storageServiceSpyObj },
        { provide: UserNotificationService, useValue: notificationSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: Storage, useValue: storageSpyObj },
        { provide: SynchronizationService, useValue: syncSpy },
        { provide: AuthorizationApiService, useValue: authApiSpy },
        { provide: IonTabs, useValue: mockIonTabs },
        { provide: Platform, useValue: platformSpyObj },
        { provide: NavController, useValue: navControllerSpyObj },
        { provide: Config, useValue: configSpyObj }
      ]
    }).compileComponents();

    sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    userNotificationServiceSpy = TestBed.inject(UserNotificationService) as jasmine.SpyObj<UserNotificationService>;
    translateServiceSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    storageSpy = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
    syncServiceSpy = TestBed.inject(SynchronizationService) as jasmine.SpyObj<SynchronizationService>;
    authApiServiceSpy = TestBed.inject(AuthorizationApiService) as jasmine.SpyObj<AuthorizationApiService>;
    platformSpy = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    navControllerSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    configSpy = TestBed.inject(Config) as jasmine.SpyObj<Config>;

    sessionServiceSpy.pendingRequests.and.returnValue(0);
    translateServiceSpy.instant.and.returnValue('Translated Text');
    platformSpy.ready.and.returnValue(Promise.resolve('core'));
    platformSpy.is.and.returnValue(false);
    configSpy.get.and.returnValue('ios');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    // Set the tabs property before detectChanges
    component.tabs = TestBed.inject(IonTabs);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.title).toBe('Jornada');
    expect(component.helpPopup).toBe('help-inventario');
    expect(component.currentTab()).toBe('activities');
  });

  it('should load user and account data on init', fakeAsync(() => {
    const mockUser = { Nombre: 'Test User' };
    const mockCuenta = { NombreCuenta: 'Test Account' };
    storageServiceSpy.get.and.callFake((key) => {
      if (key === STORAGE.USERNAME) return Promise.resolve(mockUser);
      if (key === STORAGE.ACCOUNT) return Promise.resolve(mockCuenta);
      return Promise.resolve(null);
    });
    sessionServiceSpy.countPendingRequests.and.returnValue(Promise.resolve());

    component.ngOnInit();
    tick();

    expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.USERNAME);
    expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    expect(component.nombreUsuario()).toBe('Test User');
    expect(component.nombreCuenta()).toBe('Test Account');
  }));

  it('should handle errors during initialization', fakeAsync(() => {
    storageServiceSpy.get.and.returnValue(Promise.reject('Error'));
    translateServiceSpy.instant.and.returnValue('Error message');

    component.ngOnInit();
    tick();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error message', 'middle');
  }));

  it('should handle tab changes correctly', () => {
    const mockTabs = {
      getSelected: () => 'activities'
    };
    component.tabs = mockTabs as any;

    component.onTabChange({ tab: 'activities' });
    expect(component.currentTab()).toBe('activities');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home', { outlets: { activities: ['activities'] } }]);

    component.onTabChange({ tab: 'inventario' });
    expect(component.currentTab()).toBe('inventario');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home', { outlets: { inventario: ['inventario'] } }]);
  });

  it('should update header when changing tabs', () => {
    const mockTabs = {
      getSelected: () => 'activities'
    };
    component.tabs = mockTabs as any;

    component.setHeader('HOME.TABS.SHIFT', 'help-jornada');
    expect(component.title).toBe('Translated Text');
    expect(component.helpPopup).toBe('help-jornada');
  });

  it('should handle errors in setHeader', () => {
    const mockTabs = {
      getSelected: () => 'activities'
    };
    component.tabs = mockTabs as any;
    translateServiceSpy.instant.and.throwError('Translation error');

    component.setHeader('HOME.TABS.SHIFT', 'help-jornada');
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should get sync status correctly', () => {
    sessionServiceSpy.pendingRequests.and.returnValue(5);
    expect(component.syncStatus).toBe(5);
  });

  it('should handle errors in sync status', () => {
    sessionServiceSpy.pendingRequests.and.throwError('Error');
    expect(component.syncStatus).toBe(0);
  });

  it('should count pending requests on ionViewWillEnter', fakeAsync(() => {
    component.ionViewWillEnter();
    tick();
    expect(sessionServiceSpy.countPendingRequests).toHaveBeenCalled();
  }));

  it('should handle errors in ionViewWillEnter', fakeAsync(() => {
    sessionServiceSpy.countPendingRequests.and.returnValue(Promise.reject('Error'));
    translateServiceSpy.instant.and.returnValue('Error message');

    component.ionViewWillEnter();
    tick();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error message', 'middle');
  }));
});
