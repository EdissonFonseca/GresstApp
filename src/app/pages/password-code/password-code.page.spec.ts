import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, MenuController, NavController, ToastController } from '@ionic/angular';
import { PasswordCodePage } from './password-code.page';
import { StorageService } from '@app/services/core/storage.service';
import { FormsModule } from '@angular/forms';
import { STORAGE } from '@app/constants/constants';

describe('PasswordCodePage', () => {
  let component: PasswordCodePage;
  let fixture: ComponentFixture<PasswordCodePage>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  beforeEach(async () => {
    menuCtrlSpy = jasmine.createSpyObj('MenuController', ['enable']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['get']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [PasswordCodePage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: MenuController, useValue: menuCtrlSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: ToastController, useValue: toastControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordCodePage);
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

  it('should verify code successfully and navigate to password-key page', fakeAsync(async () => {
    const mockCode = '123456';
    storageServiceSpy.get.and.returnValue(Promise.resolve(mockCode));
    component.verificationCode = mockCode;

    await component.verify();
    tick();

    expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.VERIFICATION_CODE);
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/password-key');
  }));

  it('should show error toast when code does not match', fakeAsync(async () => {
    const mockCode = '123456';
    storageServiceSpy.get.and.returnValue(Promise.resolve(mockCode));
    component.verificationCode = '654321';

    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    await component.verify();
    tick();

    expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.VERIFICATION_CODE);
    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'The code does not match',
      duration: 3000,
      position: 'middle',
      color: 'dark'
    });
    expect(mockToast.present).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).not.toHaveBeenCalled();
  }));

  it('should handle storage error', fakeAsync(async () => {
    storageServiceSpy.get.and.returnValue(Promise.reject(new Error('Storage error')));
    component.verificationCode = '123456';

    await expectAsync(component.verify()).toBeRejectedWithError('Request error: Storage error');
  }));

  it('should handle unknown error', fakeAsync(async () => {
    storageServiceSpy.get.and.returnValue(Promise.reject('Unknown error'));
    component.verificationCode = '123456';

    await expectAsync(component.verify()).toBeRejectedWithError('Unknown error: Unknown error');
  }));

  it('should render verification code input', () => {
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('ion-input[name="verificationCode"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('text');
  });

  it('should render verify button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Verificar Código');
  });

  it('should render back to login button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button[color="medium"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Regresar al inicio');
  });
});
