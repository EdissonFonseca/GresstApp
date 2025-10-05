import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, MenuController, NavController, LoadingController, ToastController } from '@ionic/angular';
import { PasswordEmailPage } from './password-email.page';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { MailService } from '@app/infrastructure/services/mail.service';
import { StorageService } from '@app/infrastructure/repositories/api/storage.repository';
import { FormsModule } from '@angular/forms';
import { STORAGE } from '@app/core/constants';

describe('PasswordEmailPage', () => {
  let component: PasswordEmailPage;
  let fixture: ComponentFixture<PasswordEmailPage>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let mailServiceSpy: jasmine.SpyObj<MailService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(async () => {
    menuCtrlSpy = jasmine.createSpyObj('MenuController', ['enable']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationApiService', ['existUser']);
    mailServiceSpy = jasmine.createSpyObj('MailService', ['sendWithToken']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['set']);

    await TestBed.configureTestingModule({
      declarations: [PasswordEmailPage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: MenuController, useValue: menuCtrlSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: LoadingController, useValue: loadingControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: AuthenticationApiService, useValue: authServiceSpy },
        { provide: MailService, useValue: mailServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable menu on init', () => {
    component.ngOnInit();
    expect(menuCtrlSpy.enable).toHaveBeenCalledWith(false);
  });

  it('should navigate to login page', () => {
    component.goLogin();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
  });

  it('should verify email and send code successfully', fakeAsync(async () => {
    const mockEmail = 'test@example.com';
    const mockCode = '123456';
    component.email = mockEmail;

    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    authServiceSpy.existUser.and.returnValue(Promise.resolve(true));
    mailServiceSpy.sendWithToken.and.returnValue(Promise.resolve(mockCode));

    await component.verify();
    tick();

    expect(loadingControllerSpy.create).toHaveBeenCalledWith({
      message: 'Connecting...',
      spinner: 'circular'
    });
    expect(mockLoading.present).toHaveBeenCalled();
    expect(authServiceSpy.existUser).toHaveBeenCalledWith(mockEmail);
    expect(mailServiceSpy.sendWithToken).toHaveBeenCalledWith(
      mockEmail,
      'Gresst - Password Change',
      'To continue, enter the following code: {Token}, in the app'
    );
    expect(storageServiceSpy.set).toHaveBeenCalledWith(STORAGE.EMAIL, mockEmail);
    expect(storageServiceSpy.set).toHaveBeenCalledWith(STORAGE.VERIFICATION_CODE, mockCode);
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/password-code');
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should show error toast when email is not registered', fakeAsync(async () => {
    const mockEmail = 'test@example.com';
    component.email = mockEmail;

    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    authServiceSpy.existUser.and.returnValue(Promise.resolve(false));

    await component.verify();
    tick();

    expect(mockLoading.present).toHaveBeenCalled();
    expect(authServiceSpy.existUser).toHaveBeenCalledWith(mockEmail);
    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'This email is not registered',
      duration: 3000,
      position: 'middle',
      color: 'dark'
    });
    expect(mockToast.present).toHaveBeenCalled();
    expect(component.email).toBe('');
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should handle error when checking user existence', fakeAsync(async () => {
    const mockEmail = 'test@example.com';
    component.email = mockEmail;

    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading as any));

    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    authServiceSpy.existUser.and.returnValue(Promise.reject(new Error('Network error')));

    await component.verify();
    tick();

    expect(mockLoading.present).toHaveBeenCalled();
    expect(authServiceSpy.existUser).toHaveBeenCalledWith(mockEmail);
    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Network error',
      duration: 3000,
      position: 'middle',
      color: 'dark'
    });
    expect(mockToast.present).toHaveBeenCalled();
    expect(component.email).toBe('');
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should render email input', () => {
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('ion-input[name="email"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('email');
  });

  it('should render verify button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Verificar');
  });

  it('should render back to login button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button[color="medium"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Regresar al inicio');
  });
});
