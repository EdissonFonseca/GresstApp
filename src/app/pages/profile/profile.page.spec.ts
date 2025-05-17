import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, AlertController } from '@ionic/angular';
import { ProfilePage } from './profile.page';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { StorageService } from '@app/services/core/storage.service';
import { Cuenta } from '@app/interfaces/cuenta.interface';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockCuenta: Cuenta = {
    IdCuenta: '1',
    IdPersonaCuenta: '1',
    IdPersonaUsuario: '1',
    IdUsuario: '1',
    LoginUsuario: 'test@example.com',
    NombreCuenta: 'Test Account',
    NombreUsuario: 'Test User',
    Ajustes: {},
    Parametros: {},
    Permisos: {}
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthenticationApiService', ['changeName', 'changePassword']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [ProfilePage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthenticationApiService, useValue: authServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with account data', fakeAsync(() => {
    storageServiceSpy.get.and.returnValue(Promise.resolve(mockCuenta));

    component.ngOnInit();
    tick();

    expect(storageServiceSpy.get).toHaveBeenCalledWith('Cuenta');
    expect(component.cuenta).toEqual(mockCuenta);
    expect(component.formData.get('Nombre')?.value).toBe(mockCuenta.NombreUsuario);
    expect(component.formData.get('Correo')?.value).toBe(mockCuenta.LoginUsuario);
  }));

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();

    component.toggleShowPassword();
    expect(component.showPassword).toBeTrue();

    component.toggleShowPassword();
    expect(component.showPassword).toBeFalse();
  });

  it('should change user name successfully', fakeAsync(() => {
    const newName = 'New Name';
    storageServiceSpy.get.and.returnValue(Promise.resolve('test@example.com'));
    authServiceSpy.changeName.and.returnValue(Promise.resolve(true));
    alertControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    component.formData.patchValue({ Nombre: newName });
    component.changeName();
    tick();

    expect(authServiceSpy.changeName).toHaveBeenCalledWith('test@example.com', newName);
    expect(storageServiceSpy.set).toHaveBeenCalledWith('Cuenta', mockCuenta);
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Name changed',
      subHeader: '',
      message: 'Your name has been successfully changed',
      buttons: ['OK']
    });
  }));

  it('should handle error when changing name', fakeAsync(() => {
    storageServiceSpy.get.and.returnValue(Promise.resolve('test@example.com'));
    authServiceSpy.changeName.and.returnValue(Promise.reject(new Error('Failed to change name')));
    alertControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    component.formData.patchValue({ Nombre: 'New Name' });
    component.changeName();
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Error',
      subHeader: '',
      message: 'An error occurred while changing your name',
      buttons: ['OK']
    });
  }));

  it('should change password successfully', fakeAsync(() => {
    const newPassword = 'newPassword123';
    storageServiceSpy.get.and.returnValue(Promise.resolve('currentPassword'));
    authServiceSpy.changePassword.and.returnValue(Promise.resolve(true));
    alertControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    component.formData.patchValue({
      ClaveActual: 'currentPassword',
      ClaveNueva: newPassword,
      ClaveConfirmar: newPassword
    });
    component.changePassword();
    tick();

    expect(authServiceSpy.changePassword).toHaveBeenCalledWith('test@example.com', newPassword);
    expect(storageServiceSpy.set).toHaveBeenCalledWith('Password', newPassword);
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Password changed',
      subHeader: '',
      message: 'Your password has been successfully changed',
      buttons: ['OK']
    });
  }));

  it('should not change password if confirmation does not match', fakeAsync(() => {
    alertControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    component.formData.patchValue({
      ClaveActual: 'currentPassword',
      ClaveNueva: 'newPassword123',
      ClaveConfirmar: 'differentPassword'
    });
    component.changePassword();
    tick();

    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Error',
      subHeader: 'Error',
      message: 'New password and confirmation do not match',
      buttons: ['OK']
    });
  }));

  it('should not change password if current password is incorrect', fakeAsync(() => {
    storageServiceSpy.get.and.returnValue(Promise.resolve('correctPassword'));
    alertControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    component.formData.patchValue({
      ClaveActual: 'wrongPassword',
      ClaveNueva: 'newPassword123',
      ClaveConfirmar: 'newPassword123'
    });
    component.changePassword();
    tick();

    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Error',
      subHeader: 'Error',
      message: 'Current password is incorrect',
      buttons: ['OK']
    });
  }));
});
