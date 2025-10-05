import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { PasswordKeyPage } from './password-key.page';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { StorageService } from '@app/infrastructure/repositories/api/storage.repository';
import { FormsModule } from '@angular/forms';
import { STORAGE } from '@app/core/constants';

describe('PasswordKeyPage', () => {
  let component: PasswordKeyPage;
  let fixture: ComponentFixture<PasswordKeyPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationApiService', ['changePassword']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['get']);

    await TestBed.configureTestingModule({
      declarations: [PasswordKeyPage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: AuthenticationApiService, useValue: authServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordKeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login page', () => {
    component.goLogin();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  });

  it('should show error toast when passwords are empty', fakeAsync(async () => {
    component.newPassword = '';
    component.confirmPassword = '';

    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    await component.create();
    tick();

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Please enter username and password',
      duration: 3000,
      position: 'middle'
    });
    expect(mockToast.present).toHaveBeenCalled();
    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
  }));

  it('should change password successfully', fakeAsync(async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'newPassword123';
    component.newPassword = mockPassword;
    component.confirmPassword = mockPassword;

    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockAlert = {
      present: jasmine.createSpy('present')
    };
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

    storageServiceSpy.get.and.returnValue(Promise.resolve(mockEmail));
    authServiceSpy.changePassword.and.returnValue(Promise.resolve(true));

    await component.create();
    tick();

    expect(loadingControllerSpy.create).toHaveBeenCalledWith({
      message: 'Connecting...',
      spinner: 'circular'
    });
    expect(mockLoading.present).toHaveBeenCalled();
    expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.EMAIL);
    expect(authServiceSpy.changePassword).toHaveBeenCalledWith(mockEmail, mockPassword);
    expect(mockLoading.dismiss).toHaveBeenCalled();
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Password Changed',
      message: 'Your password has been successfully changed',
      buttons: ['OK']
    });
    expect(mockAlert.present).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  }));

  it('should handle error when changing password', fakeAsync(async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'newPassword123';
    component.newPassword = mockPassword;
    component.confirmPassword = mockPassword;

    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    storageServiceSpy.get.and.returnValue(Promise.resolve(mockEmail));
    authServiceSpy.changePassword.and.returnValue(Promise.reject(new Error('Network error')));

    await expectAsync(component.create()).toBeRejectedWithError('Request error: Network error');
    tick();

    expect(mockLoading.present).toHaveBeenCalled();
    expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.EMAIL);
    expect(authServiceSpy.changePassword).toHaveBeenCalledWith(mockEmail, mockPassword);
    expect(mockLoading.dismiss).toHaveBeenCalled();
    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Network error',
      duration: 3000,
      position: 'middle'
    });
    expect(mockToast.present).toHaveBeenCalled();
  }));

  it('should render new password input', () => {
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('ion-input[name="newPassword"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('password');
  });

  it('should render confirm password input', () => {
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('ion-input[name="confirmPassword"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('password');
  });

  it('should render change password button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Cambiar Contraseña');
  });

  it('should render back to login button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button[color="medium"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Regresar al inicio');
  });
});
