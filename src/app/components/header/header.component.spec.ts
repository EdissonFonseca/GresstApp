import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from './header.component';
import { SynchronizationService } from '@app/services/synchronization.service';
import { GlobalesService } from '@app/services/globales.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let globalesServiceSpy: jasmine.SpyObj<GlobalesService>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    syncServiceSpy = jasmine.createSpyObj('SynchronizationService', ['refresh', 'pendingTransactions']);
    globalesServiceSpy = jasmine.createSpyObj('GlobalesService', ['presentToast']);

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: SynchronizationService, useValue: syncServiceSpy },
        { provide: GlobalesService, useValue: globalesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pageTitle).toBe('Gresst');
    expect(component.helpPopup).toBe('');
  });

  it('should show help modal when helpPopup is set', async () => {
    const mockModal: any = { present: () => Promise.resolve() };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

    component.helpPopup = 'test-help';
    await component.showHelp();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith({
      component: 'app-help-popup',
      componentProps: {
        popupId: 'test-help'
      }
    });
  });

  it('should not show help modal when helpPopup is empty', async () => {
    component.helpPopup = '';
    await component.showHelp();

    expect(modalCtrlSpy.create).not.toHaveBeenCalled();
  });

  it('should handle successful synchronization', async () => {
    syncServiceSpy.refresh.and.returnValue(Promise.resolve(true));

    await component.synchronize();

    expect(globalesServiceSpy.presentToast).toHaveBeenCalledWith(
      'Sincronización exitosa',
      'middle'
    );
  });

  it('should handle failed synchronization', async () => {
    syncServiceSpy.refresh.and.returnValue(Promise.resolve(false));

    await component.synchronize();

    expect(globalesServiceSpy.presentToast).toHaveBeenCalledWith(
      'Sincronización fallida. Intente de nuevo mas tarde',
      'middle'
    );
  });

  it('should return correct color based on pending transactions', () => {
    syncServiceSpy.pendingTransactions.and.returnValue(1);
    expect(component.getColor()).toBe('danger');

    syncServiceSpy.pendingTransactions.and.returnValue(0);
    expect(component.getColor()).toBe('success');
  });
});
