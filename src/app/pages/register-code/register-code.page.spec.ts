import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, MenuController, NavController, ToastController } from '@ionic/angular';
import { RegisterCodePage } from './register-code.page';
import { StorageService } from '@app/services/core/storage.service';
import { STORAGE } from '@app/constants/constants';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

describe('RegisterCodePage', () => {
  let component: RegisterCodePage;
  let fixture: ComponentFixture<RegisterCodePage>;
  let menuCtrlSpy: jasmine.SpyObj<MenuController>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;

  beforeEach(waitForAsync(() => {
    menuCtrlSpy = jasmine.createSpyObj('MenuController', ['enable']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    storageSpy = jasmine.createSpyObj('StorageService', ['get']);
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        RegisterCodePage
      ],
      providers: [
        { provide: MenuController, useValue: menuCtrlSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: ToastController, useValue: toastCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable menu on initialization', () => {
    expect(menuCtrlSpy.enable).toHaveBeenCalledWith(false);
  });

  it('should navigate to register-key when code matches', async () => {
    const mockCode = '123456';
    component.verificationCode = mockCode;
    storageSpy.get.and.returnValue(Promise.resolve(mockCode));
    toastCtrlSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    await component.verify();

    expect(storageSpy.get).toHaveBeenCalledWith(STORAGE.VERIFICATION_CODE);
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/register-key');
  });

  it('should show error toast when code does not match', async () => {
    const mockCode = '123456';
    component.verificationCode = '654321';
    storageSpy.get.and.returnValue(Promise.resolve(mockCode));
    toastCtrlSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    await component.verify();

    expect(storageSpy.get).toHaveBeenCalledWith(STORAGE.VERIFICATION_CODE);
    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'The code does not match',
      duration: 3000,
      position: 'middle',
      color: 'dark'
    });
    expect(navCtrlSpy.navigateRoot).not.toHaveBeenCalled();
  });

  it('should handle storage error', async () => {
    const error = new Error('Storage error');
    storageSpy.get.and.returnValue(Promise.reject(error));

    await expectAsync(component.verify()).toBeRejectedWithError('Request error: Storage error');
  });

  it('should handle unknown error', async () => {
    storageSpy.get.and.returnValue(Promise.reject('Unknown error'));

    await expectAsync(component.verify()).toBeRejectedWithError('Unknown error: Unknown error');
  });

  it('should render header with title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Crear cuenta');
  });

  it('should render logo', () => {
    const compiled = fixture.nativeElement;
    const logo = compiled.querySelector('img.logo');
    expect(logo).toBeTruthy();
    expect(logo.getAttribute('src')).toContain('Gresst.png');
  });

  it('should render verification code input', () => {
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('ion-input[name="verificationCode"]');
    expect(input).toBeTruthy();
  });

  it('should render verify button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Verificar Código');
  });
});
