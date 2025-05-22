import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { SessionService } from '@app/services/core/session.service';
import { ComponentsModule } from '@app/components/components.module';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from '@app/services/core/storage.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { STORAGE } from '@app/constants/constants';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const sessionSpy = jasmine.createSpyObj('SessionService', ['countPendingTransactions', 'pendingTransactions']);
    const storageSpy = jasmine.createSpyObj('StorageService', ['get']);
    const notificationSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [
        IonicModule.forRoot(),
        ComponentsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SessionService, useValue: sessionSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: UserNotificationService, useValue: notificationSpy },
        { provide: TranslateService, useValue: translateSpy }
      ]
    }).compileComponents();

    sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    userNotificationServiceSpy = TestBed.inject(UserNotificationService) as jasmine.SpyObj<UserNotificationService>;
    translateServiceSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.title).toBe('Jornada');
    expect(component.helpPopup).toBe('help-inventario');
    expect(component.currentTab()).toBe('actividades');
  });

  it('should count pending transactions on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(sessionServiceSpy.countPendingTransactions).toHaveBeenCalled();
  }));

  it('should load user data on init', fakeAsync(() => {
    const mockUser = { Nombre: 'Test User' };
    storageServiceSpy.get.and.returnValue(Promise.resolve(mockUser));

    component.ngOnInit();
    tick();

    expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.USERNAME);
    expect(component.nombreUsuario()).toBe('Test User');
  }));

  it('should load account data on init', fakeAsync(() => {
    const mockCuenta = { NombreCuenta: 'Test Account' };
    storageServiceSpy.get.and.returnValue(Promise.resolve(mockCuenta));

    component.ngOnInit();
    tick();

    expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    expect(component.nombreCuenta()).toBe('Test Account');
  }));

  it('should handle errors during initialization', fakeAsync(() => {
    const errorMessage = 'Error loading data';
    translateServiceSpy.instant.and.returnValue(errorMessage);
    storageServiceSpy.get.and.returnValue(Promise.reject('Error'));

    component.ngOnInit();
    tick();

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('HOME.MESSAGES.LOAD_ERROR');
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith(errorMessage, 'middle');
  }));

  it('should update header title and help popup', () => {
    component.setHeader('New Title', 'new-help');
    expect(component.title).toBe('New Title');
    expect(component.helpPopup).toBe('new-help');
  });

  it('should handle tab changes', () => {
    const mockEvent = { tab: 'inventario' };
    component.onTabChange(mockEvent);
    expect(component.currentTab()).toBe('inventario');
  });

  it('should get sync status', () => {
    const mockPendingTransactions = 5;
    sessionServiceSpy.pendingTransactions.and.returnValue(mockPendingTransactions);

    expect(component.syncStatus).toBe(mockPendingTransactions);
    expect(sessionServiceSpy.pendingTransactions).toHaveBeenCalled();
  });

  it('should handle tab selection in setHeader', () => {
    const mockTabs = {
      getSelected: () => 'inventario'
    };
    component.tabs = mockTabs as any;

    component.setHeader('New Title', 'new-help');
    expect(component.currentTab()).toBe('inventario');
  });

  it('should handle errors in onTabChange', () => {
    const error = new Error('Test error');
    spyOn(console, 'error');
    translateServiceSpy.instant.and.returnValue('Error message');

    component.onTabChange({ tab: 'invalid' });
    expect(console.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should handle errors in setHeader', () => {
    const error = new Error('Test error');
    spyOn(console, 'error');
    translateServiceSpy.instant.and.returnValue('Error message');

    component.setHeader('', '');
    expect(console.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should handle errors in syncStatus getter', () => {
    const error = new Error('Test error');
    spyOn(console, 'error');
    sessionServiceSpy.pendingTransactions.and.throwError(error);

    const status = component.syncStatus;
    expect(status).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('should count pending transactions on ionViewWillEnter', fakeAsync(() => {
    component.ionViewWillEnter();
    tick();
    expect(sessionServiceSpy.countPendingTransactions).toHaveBeenCalled();
  }));

  it('should handle errors in ionViewWillEnter', fakeAsync(() => {
    const error = new Error('Test error');
    sessionServiceSpy.countPendingTransactions.and.rejectWith(error);
    translateServiceSpy.instant.and.returnValue('Error message');

    component.ionViewWillEnter();
    tick();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  }));

  describe('tabs integration', () => {
    it('should have tabs component initialized', () => {
      expect(component.tabs).toBeTruthy();
    });

    it('should have correct tab buttons', () => {
      const tabButtons = fixture.debugElement.nativeElement.querySelectorAll('ion-tab-button');
      expect(tabButtons.length).toBe(2);
      expect(tabButtons[0].textContent).toContain('HOME.TABS.SHIFT');
      expect(tabButtons[1].textContent).toContain('HOME.TABS.INVENTORY');
    });
  });
});
