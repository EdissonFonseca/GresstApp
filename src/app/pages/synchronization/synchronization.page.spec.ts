import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { SynchronizationPage } from './synchronization.page';
import { SessionService } from '@app/services/core/session.service';
import { Utils } from '@app/utils/utils';

describe('SynchronizationPage', () => {
  let component: SynchronizationPage;
  let fixture: ComponentFixture<SynchronizationPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;

  beforeEach(waitForAsync(() => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['refresh']);

    TestBed.configureTestingModule({
      declarations: [SynchronizationPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: SessionService, useValue: sessionServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SynchronizationPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading and handle successful synchronization', fakeAsync(async () => {
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    spyOn(Utils, 'showToast');
    sessionServiceSpy.refresh.and.returnValue(Promise.resolve(true));

    await component.synchronize();
    tick();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.hideLoading).toHaveBeenCalled();
    expect(Utils.showToast).toHaveBeenCalledWith('Sincronización exitosa', 'middle');
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/home');
  }));

  it('should handle failed synchronization due to server connection', fakeAsync(async () => {
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    spyOn(Utils, 'showToast');
    sessionServiceSpy.refresh.and.returnValue(Promise.resolve(false));

    await component.synchronize();
    tick();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.hideLoading).toHaveBeenCalled();
    expect(Utils.showToast).toHaveBeenCalledWith(
      'No hay conexión con el servidor. Intente de nuevo más tarde',
      'middle'
    );
    expect(navCtrlSpy.navigateForward).not.toHaveBeenCalled();
  }));

  it('should handle synchronization error', fakeAsync(async () => {
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    spyOn(Utils, 'showToast');
    spyOn(console, 'error');
    const error = new Error('Sync failed');
    sessionServiceSpy.refresh.and.returnValue(Promise.reject(error));

    await component.synchronize();
    tick();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.hideLoading).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error durante la sincronización:', error);
    expect(Utils.showToast).toHaveBeenCalledWith(
      'Error durante la sincronización. Intente de nuevo más tarde',
      'middle'
    );
    expect(navCtrlSpy.navigateForward).not.toHaveBeenCalled();
  }));
});
