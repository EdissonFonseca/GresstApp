import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController, LoadingController, AlertController } from '@ionic/angular';
import { RegisterKeyPage } from './register-key.page';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { StorageService } from '@app/services/core/storage.service';
import { STORAGE } from '@app/constants/constants';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

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
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        RegisterKeyPage
      ],
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

    expect(storageSpy.get).toHaveBeenCalledWith(STORAGE.EMAIL);
    expect(storageSpy.get).toHaveBeenCalledWith(STORAGE.FULLNAME);
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

  it('should handle unknown error', fakeAsync(async () => {
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

    authServiceSpy.register.and.returnValue(Promise.reject('Unknown error'));

    await expectAsync(component.create()).toBeRejectedWithError('Unknown error: Unknown error');
    tick();

    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should render header with title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('login');
  });

  it('should render logo', () => {
    const compiled = fixture.nativeElement;
    const logo = compiled.querySelector('img.logo');
    expect(logo).toBeTruthy();
    expect(logo.getAttribute('src')).toContain('Gresst.png');
  });

  it('should render password input', () => {
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('ion-input[name="newPassword"]');
    expect(input).toBeTruthy();
  });

  it('should render confirm password input', () => {
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('ion-input[name="confirmPassword"]');
    expect(input).toBeTruthy();
  });

  it('should render create account button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Crear la cuenta');
  });
});
