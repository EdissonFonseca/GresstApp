import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { SynchronizationPage } from './synchronization.page';
import { SessionService } from '@app/infrastructure/services/session.service';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

describe('SynchronizationPage', () => {
  let component: SynchronizationPage;
  let fixture: ComponentFixture<SynchronizationPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;

  beforeEach(waitForAsync(() => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['synchronize']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', [
      'showLoading',
      'hideLoading',
      'showToast'
    ]);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        SynchronizationPage
      ],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SynchronizationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading and handle successful synchronization', fakeAsync(async () => {
    sessionServiceSpy.synchronize.and.returnValue(Promise.resolve(true));

    await component.synchronize();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.synchronize).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Sincronización exitosa', 'middle');
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/home');
  }));

  it('should handle failed synchronization due to server connection', fakeAsync(async () => {
    sessionServiceSpy.synchronize.and.returnValue(Promise.resolve(false));

    await component.synchronize();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.synchronize).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith(
      'No hay conexión con el servidor. Intente de nuevo más tarde',
      'middle'
    );
    expect(navCtrlSpy.navigateForward).not.toHaveBeenCalled();
  }));

  it('should handle synchronization error', fakeAsync(async () => {
    const error = new Error('Sync failed');
    sessionServiceSpy.synchronize.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    await component.synchronize();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.synchronize).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error durante la sincronización:', error);
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith(
      'Error durante la sincronización. Intente de nuevo más tarde',
      'middle'
    );
    expect(navCtrlSpy.navigateForward).not.toHaveBeenCalled();
  }));

  it('should render header with back button and title', () => {
    const compiled = fixture.nativeElement;
    const backButton = compiled.querySelector('ion-back-button');
    const title = compiled.querySelector('ion-title');

    expect(backButton).toBeTruthy();
    expect(title.textContent).toContain('Sincronizar');
  });

  it('should render synchronization description', () => {
    const compiled = fixture.nativeElement;
    const description = compiled.querySelector('ion-label');

    expect(description).toBeTruthy();
    expect(description.textContent).toContain('Esta operación envía los datos locales al servidor y obtiene los datos actualizados');
  });

  it('should render synchronize button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button');

    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Sincronizar');
    expect(button.getAttribute('color')).toBe('success');
    expect(button.getAttribute('size')).toBe('large');
  });

  it('should render content with fullscreen attribute', () => {
    const compiled = fixture.nativeElement;
    const content = compiled.querySelector('ion-content');

    expect(content).toBeTruthy();
    expect(content.getAttribute('fullscreen')).toBe('true');
  });
});
