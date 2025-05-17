import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from './header.component';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { SessionService } from '@app/services/core/session.service';
import { Utils } from '@app/utils/utils';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;

  beforeEach(async () => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    syncServiceSpy = jasmine.createSpyObj('SynchronizationService', ['pendingTransactions']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['refresh']);

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: SynchronizationService, useValue: syncServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy }
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
  });

  it('should update pageTitle when input changes', () => {
    const newTitle = 'New Title';
    component.pageTitle = newTitle;
    fixture.detectChanges();
    expect(component.pageTitle).toBe(newTitle);
  });

  it('should update helpPopup when input changes', () => {
    const newHelpPopup = 'help-id';
    component.helpPopup = newHelpPopup;
    fixture.detectChanges();
    expect(component.helpPopup).toBe(newHelpPopup);
  });

  it('should return danger color when there are pending transactions', () => {
    syncServiceSpy.pendingTransactions.and.returnValue(1);
    expect(component.getColor()).toBe('danger');
  });

  it('should return success color when there are no pending transactions', () => {
    syncServiceSpy.pendingTransactions.and.returnValue(0);
    expect(component.getColor()).toBe('success');
  });

  it('should show success toast when synchronization is successful', fakeAsync(() => {
    sessionServiceSpy.refresh.and.returnValue(Promise.resolve(true));
    spyOn(Utils, 'showToast');

    component.synchronize();
    tick();

    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.showToast).toHaveBeenCalledWith('Sincronización exitosa', 'middle');
  }));

  it('should show error toast when synchronization fails', fakeAsync(() => {
    sessionServiceSpy.refresh.and.returnValue(Promise.resolve(false));
    spyOn(Utils, 'showToast');

    component.synchronize();
    tick();

    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.showToast).toHaveBeenCalledWith('Sincronización fallida. Intente de nuevo mas tarde', 'middle');
  }));

  it('should show help popup when helpPopup is set', async () => {
    const helpPopupId = 'test-help';
    component.helpPopup = helpPopupId;
    const mockModal = {
      present: jasmine.createSpy('present')
    } as any;
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

    await component.showHelp();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith({
      component: 'app-help-popup',
      componentProps: {
        popupId: helpPopupId
      }
    });
    expect(mockModal.present).toHaveBeenCalled();
  });

  it('should not show help popup when helpPopup is empty', async () => {
    component.helpPopup = '';
    await component.showHelp();
    expect(modalCtrlSpy.create).not.toHaveBeenCalled();
  });
});
