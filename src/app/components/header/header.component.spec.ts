import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from './header.component';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { SessionService } from '@app/services/core/session.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    syncServiceSpy = jasmine.createSpyObj('SynchronizationService', ['pendingTransactions']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['countPendingRequests', 'synchronize']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', [
      'showLoading',
      'hideLoading',
      'showToast'
    ]);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: SynchronizationService, useValue: syncServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pageTitle).toBe('Gresst');
    expect(component.helpPopup).toBe('');
    expect(component.isOpen).toBeFalse();
    expect(component.pendingRequests).toBe(0);
  });

  it('should update pageTitle when input changes', () => {
    const newTitle = 'New Title';
    component.pageTitle = newTitle;
    fixture.detectChanges();
    expect(component.pageTitle).toBe(newTitle);
  });

  it('should update helpPopup when input changes', () => {
    const newHelpPopup = 'help-popup-id';
    component.helpPopup = newHelpPopup;
    fixture.detectChanges();
    expect(component.helpPopup).toBe(newHelpPopup);
  });

  it('should update pending requests count periodically', fakeAsync(() => {
    sessionServiceSpy.countPendingRequests.and.returnValue(Promise.resolve());
    syncServiceSpy.pendingTransactions.and.returnValue(5);

    component.ngOnInit();
    tick(2000);

    expect(sessionServiceSpy.countPendingRequests).toHaveBeenCalled();
    expect(component.pendingRequests).toBe(5);
  }));

  it('should unsubscribe from updates on destroy', () => {
    component.ngOnInit();
    component.ngOnDestroy();
    expect(component['updateSubscription']?.closed).toBeTrue();
  });

  it('should show success message on successful synchronization', fakeAsync(async () => {
    translateServiceSpy.instant.and.returnValue('Synchronization message');
    sessionServiceSpy.synchronize.and.returnValue(Promise.resolve(true));
    userNotificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    userNotificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    userNotificationServiceSpy.showToast.and.returnValue(Promise.resolve());

    await component.synchronize();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.synchronize).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith(
      'Synchronization message',
      'middle'
    );
  }));

  it('should show error message on failed synchronization', fakeAsync(async () => {
    translateServiceSpy.instant.and.returnValue('Error message');
    sessionServiceSpy.synchronize.and.returnValue(Promise.resolve(false));
    userNotificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    userNotificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    userNotificationServiceSpy.showToast.and.returnValue(Promise.resolve());

    await component.synchronize();
    tick();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith(
      'Error message',
      'middle'
    );
  }));

  it('should show error message on synchronization exception', fakeAsync(async () => {
    translateServiceSpy.instant.and.returnValue('Error message');
    sessionServiceSpy.synchronize.and.returnValue(Promise.reject('Error'));
    userNotificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    userNotificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    userNotificationServiceSpy.showToast.and.returnValue(Promise.resolve());

    await component.synchronize();
    tick();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith(
      'Error message',
      'middle'
    );
  }));

  it('should return danger color when there are pending transactions', () => {
    syncServiceSpy.pendingTransactions.and.returnValue(1);
    expect(component.getColor()).toBe('danger');
  });

  it('should return success color when there are no pending transactions', () => {
    syncServiceSpy.pendingTransactions.and.returnValue(0);
    expect(component.getColor()).toBe('success');
  });

  it('should return success color on error getting sync status', () => {
    syncServiceSpy.pendingTransactions.and.throwError('Error');
    expect(component.getColor()).toBe('success');
  });

  it('should show help popup when helpPopup is provided', async () => {
    const mockModal = {
      present: () => Promise.resolve(),
      dismiss: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: null, role: null }),
      onWillDismiss: () => Promise.resolve({ data: null, role: null }),
      addEventListener: () => {},
      removeEventListener: () => {},
      animated: true,
      backdropBreakpoint: 0,
      breakpoints: [0, 1],
      canDismiss: true,
      cssClass: '',
      enterAnimation: undefined,
      leaveAnimation: undefined,
      keyboardClose: true,
      mode: 'ios',
      showBackdrop: true,
      willAnimate: true
    } as any;
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));
    component.helpPopup = 'help-popup-id';

    await component.showHelp();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith({
      component: 'app-help-popup',
      componentProps: {
        popupId: 'help-popup-id'
      }
    });
  });

  it('should not show help popup when helpPopup is empty', async () => {
    component.helpPopup = '';
    await component.showHelp();
    expect(modalCtrlSpy.create).not.toHaveBeenCalled();
  });

  it('should show error message when help popup fails', async () => {
    translateServiceSpy.instant.and.returnValue('Error message');
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));
    userNotificationServiceSpy.showToast.and.returnValue(Promise.resolve());
    component.helpPopup = 'help-popup-id';

    await component.showHelp();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith(
      'Error message',
      'middle'
    );
  });
});
