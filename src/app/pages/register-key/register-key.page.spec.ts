import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController, LoadingController, AlertController } from '@ionic/angular';
import { RegisterKeyPage } from './register-key.page';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { StorageService } from '@app/services/core/storage.service';

describe('RegisterKeyPage', () => {
  let component: RegisterKeyPage;
  let fixture: ComponentFixture<RegisterKeyPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let loadingCtrlSpy: jasmine.SpyObj<LoadingController>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(waitForAsync(() => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    loadingCtrlSpy = jasmine.createSpyObj('LoadingController', ['create']);
    alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationApiService', ['register']);
    storageSpy = jasmine.createSpyObj('StorageService', ['get']);

    TestBed.configureTestingModule({
      declarations: [RegisterKeyPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: LoadingController, useValue: loadingCtrlSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: AuthenticationApiService, useValue: authServiceSpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterKeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show alert when passwords are empty', fakeAsync(async () => {
    const mockAlert = {
      present: jasmine.createSpy('present')
    };
    alertCtrlSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

    component.newPassword = '';
    component.confirmPassword = '';

    await component.create();
    tick();

    expect(alertCtrlSpy.create).toHaveBeenCalledWith({
      header: 'Error',
      subHeader: '',
      message: 'Please enter username and password',
      buttons: ['OK']
    });
    expect(mockAlert.present).toHaveBeenCalled();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  }));

  it('should show loading indicator during registration', fakeAsync(async () => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockAlert = {
      present: jasmine.createSpy('present')
    };
    alertCtrlSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

    const mockEmail = 'test@example.com';
    const mockName = 'Test User';
    const mockPassword = 'password123';
    component.newPassword = mockPassword;
    component.confirmPassword = mockPassword;

    storageSpy.get.and.returnValues(
      Promise.resolve(mockEmail),
      Promise.resolve(mockName)
    );
    authServiceSpy.register.and.returnValue(Promise.resolve(true));

    await component.create();
    tick();

    expect(loadingCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Connecting...',
      spinner: 'circular'
    });
    expect(mockLoading.present).toHaveBeenCalled();
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should register user and navigate to login on success', fakeAsync(async () => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockAlert = {
      present: jasmine.createSpy('present')
    };
    alertCtrlSpy.create.and.returnValue(Promise.resolve(mockAlert as any));

    const mockEmail = 'test@example.com';
    const mockName = 'Test User';
    const mockPassword = 'password123';
    component.newPassword = mockPassword;
    component.confirmPassword = mockPassword;

    storageSpy.get.and.returnValues(
      Promise.resolve(mockEmail),
      Promise.resolve(mockName)
    );
    authServiceSpy.register.and.returnValue(Promise.resolve(true));

    await component.create();
    tick();

    expect(storageSpy.get).toHaveBeenCalledWith('Email');
    expect(storageSpy.get).toHaveBeenCalledWith('Name');
    expect(authServiceSpy.register).toHaveBeenCalledWith(mockEmail, mockName, mockPassword);
    expect(alertCtrlSpy.create).toHaveBeenCalledWith({
      header: 'User registered',
      subHeader: '',
      message: 'User registered successfully',
      buttons: ['OK']
    });
    expect(mockAlert.present).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  }));

  it('should handle authentication service error', fakeAsync(async () => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockEmail = 'test@example.com';
    const mockName = 'Test User';
    const mockPassword = 'password123';
    component.newPassword = mockPassword;
    component.confirmPassword = mockPassword;

    storageSpy.get.and.returnValues(
      Promise.resolve(mockEmail),
      Promise.resolve(mockName)
    );

    const errorMessage = 'Registration failed';
    authServiceSpy.register.and.returnValue(Promise.reject(new Error(errorMessage)));

    await expectAsync(component.create()).toBeRejectedWithError('Request error: Registration failed');
    tick();

    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));
});
