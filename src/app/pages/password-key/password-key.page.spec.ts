import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { PasswordKeyPage } from './password-key.page';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { StorageService } from '@app/services/core/storage.service';

describe('PasswordKeyPage', () => {
  let component: PasswordKeyPage;
  let fixture: ComponentFixture<PasswordKeyPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationApiService', ['changePassword']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['get']);

    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    await TestBed.configureTestingModule({
      declarations: [PasswordKeyPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
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
      present: jasmine.createSpy('present'),
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dismiss: jasmine.createSpy('dismiss'),
      onDidDismiss: jasmine.createSpy('onDidDismiss'),
      onWillDismiss: jasmine.createSpy('onWillDismiss')
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

    storageServiceSpy.get.and.returnValue(Promise.resolve(mockEmail));
    authServiceSpy.changePassword.and.returnValue(Promise.resolve(true));

    const mockAlert = {
      present: jasmine.createSpy('present'),
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dismiss: jasmine.createSpy('dismiss'),
      onDidDismiss: jasmine.createSpy('onDidDismiss'),
      onWillDismiss: jasmine.createSpy('onWillDismiss')
    };
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

    await component.create();
    tick();

    expect(loadingControllerSpy.create).toHaveBeenCalledWith({
      message: 'Connecting...',
      spinner: 'circular'
    });
    expect(storageServiceSpy.get).toHaveBeenCalledWith('Email');
    expect(authServiceSpy.changePassword).toHaveBeenCalledWith(mockEmail, mockPassword);
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Password Changed',
      message: 'Your password has been successfully changed',
      buttons: ['OK']
    });
    expect(mockAlert.present).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  }));

  it('should handle authentication service error', fakeAsync(async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'newPassword123';
    component.newPassword = mockPassword;
    component.confirmPassword = mockPassword;

    const errorMessage = 'Authentication error';
    storageServiceSpy.get.and.returnValue(Promise.resolve(mockEmail));
    authServiceSpy.changePassword.and.returnValue(Promise.reject(new Error(errorMessage)));

    const mockToast = {
      present: jasmine.createSpy('present'),
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dismiss: jasmine.createSpy('dismiss'),
      onDidDismiss: jasmine.createSpy('onDidDismiss'),
      onWillDismiss: jasmine.createSpy('onWillDismiss')
    };
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    await expectAsync(component.create()).toBeRejectedWithError('Request error: Authentication error');
    tick();

    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: errorMessage,
      duration: 3000,
      position: 'middle'
    });
    expect(mockToast.present).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).not.toHaveBeenCalled();
  }));
});
