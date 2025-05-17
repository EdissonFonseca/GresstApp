import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, MenuController, NavController, LoadingController, ToastController } from '@ionic/angular';
import { RegisterEmailPage } from './register-email.page';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { MailService } from '@app/services/core/mail.service';
import { StorageService } from '@app/services/core/storage.service';

describe('RegisterEmailPage', () => {
  let component: RegisterEmailPage;
  let fixture: ComponentFixture<RegisterEmailPage>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let loadingCtrlSpy: jasmine.SpyObj<LoadingController>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let mailServiceSpy: jasmine.SpyObj<MailService>;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(waitForAsync(() => {
    menuCtrlSpy = jasmine.createSpyObj('MenuController', ['enable']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    loadingCtrlSpy = jasmine.createSpyObj('LoadingController', ['create']);
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationApiService', ['existUser']);
    mailServiceSpy = jasmine.createSpyObj('MailService', ['sendWithToken']);
    storageSpy = jasmine.createSpyObj('StorageService', ['set']);

    TestBed.configureTestingModule({
      declarations: [RegisterEmailPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: MenuController, useValue: menuCtrlSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: LoadingController, useValue: loadingCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
        { provide: AuthenticationApiService, useValue: authServiceSpy },
        { provide: MailService, useValue: mailServiceSpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable menu on initialization', () => {
    expect(menuCtrlSpy.enable).toHaveBeenCalledWith(false);
  });

  it('should show loading indicator during verification', fakeAsync(async () => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockEmail = 'test@example.com';
    const mockName = 'Test User';
    component.email = mockEmail;
    component.name = mockName;

    authServiceSpy.existUser.and.returnValue(Promise.resolve(false));
    mailServiceSpy.sendWithToken.and.returnValue(Promise.resolve('123456'));

    await component.verify();
    tick();

    expect(loadingCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Connecting...',
      spinner: 'circular'
    });
    expect(mockLoading.present).toHaveBeenCalled();
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should navigate to register-code when email is not registered', fakeAsync(async () => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockEmail = 'test@example.com';
    const mockName = 'Test User';
    const mockCode = '123456';
    component.email = mockEmail;
    component.name = mockName;

    authServiceSpy.existUser.and.returnValue(Promise.resolve(false));
    mailServiceSpy.sendWithToken.and.returnValue(Promise.resolve(mockCode));

    await component.verify();
    tick();

    expect(storageSpy.set).toHaveBeenCalledWith('Email', mockEmail);
    expect(storageSpy.set).toHaveBeenCalledWith('Name', mockName);
    expect(storageSpy.set).toHaveBeenCalledWith('Code', mockCode);
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/register-code');
  }));

  it('should show error toast when email is already registered', fakeAsync(async () => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    const mockEmail = 'test@example.com';
    const mockName = 'Test User';
    component.email = mockEmail;
    component.name = mockName;

    authServiceSpy.existUser.and.returnValue(Promise.resolve(true));

    await component.verify();
    tick();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'This email is already registered',
      duration: 3000,
      position: 'middle',
      color: 'dark'
    });
    expect(mockToast.present).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).not.toHaveBeenCalled();
  }));

  it('should handle authentication service error', fakeAsync(async () => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    const mockEmail = 'test@example.com';
    const mockName = 'Test User';
    component.email = mockEmail;
    component.name = mockName;

    const errorMessage = 'Authentication error';
    authServiceSpy.existUser.and.returnValue(Promise.reject(new Error(errorMessage)));

    await expectAsync(component.verify()).toBeRejectedWithError('Request error: Authentication error');
    tick();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: errorMessage,
      duration: 3000,
      position: 'middle',
      color: 'dark'
    });
    expect(mockToast.present).toHaveBeenCalled();
  }));
});
