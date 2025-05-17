import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { SessionService } from '@app/services/core/session.service';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { Utils } from '@app/utils/utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let utilsSpy: jasmine.SpyObj<typeof Utils>;
  let translateService: TranslateService;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthenticationApiService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const sessionSpy = jasmine.createSpyObj('SessionService', ['isOnline', 'load']);
    const utilsSpyObj = jasmine.createSpyObj('Utils', ['showAlert', 'showToast']);

    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        { provide: AuthenticationApiService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: SessionService, useValue: sessionSpy },
        { provide: Utils, useValue: utilsSpyObj }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthenticationApiService) as jasmine.SpyObj<AuthenticationApiService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loadingControllerSpy = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    utilsSpy = TestBed.inject(Utils) as unknown as jasmine.SpyObj<typeof Utils>;
    translateService = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty values', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('username');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password length', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should handle successful login', fakeAsync(() => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    } as any;

    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading));
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.load.and.returnValue(Promise.resolve(true));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'password123'
    });

    component.login();
    tick();

    expect(loadingControllerSpy.create).toHaveBeenCalled();
    expect(mockLoading.present).toHaveBeenCalled();
    expect(sessionServiceSpy.isOnline).toHaveBeenCalled();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(sessionServiceSpy.load).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should handle offline state', fakeAsync(() => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    } as any;

    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading));
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(false));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'password123'
    });

    component.login();
    tick();

    expect(utilsSpy.showAlert).toHaveBeenCalledWith('Authentication Error', 'Could not connect to the server');
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should handle invalid credentials', fakeAsync(() => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    } as any;

    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading));
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve(false));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'wrongpassword'
    });

    component.login();
    tick();

    expect(utilsSpy.showAlert).toHaveBeenCalledWith('Authentication Error', 'Invalid credentials');
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should handle server error', fakeAsync(() => {
    const mockLoading = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    } as any;

    loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading));
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.reject({ status: 500 }));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'password123'
    });

    component.login();
    tick();

    expect(utilsSpy.showAlert).toHaveBeenCalledWith('Authentication Error', 'Error during login');
    expect(mockLoading.dismiss).toHaveBeenCalled();
  }));

  it('should handle password recovery', fakeAsync(() => {
    component.loginForm.setValue({
      username: 'test@example.com',
      password: ''
    });

    component.recoverPassword();
    tick();

    expect(utilsSpy.showToast).toHaveBeenCalledWith('A recovery email has been sent with instructions', 'top');
  }));

  describe('Translation Tests', () => {
    it('should show error message in Spanish', fakeAsync(() => {
      translateService.setDefaultLang('es');
      translateService.use('es');

      const mockLoading = {
        present: jasmine.createSpy('present'),
        dismiss: jasmine.createSpy('dismiss')
      } as any;

      loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading));
      sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(false));

      component.loginForm.setValue({
        username: 'test@example.com',
        password: 'password123'
      });

      component.login();
      tick();

      expect(utilsSpy.showAlert).toHaveBeenCalledWith(
        'Error de Autenticación',
        'No hay conexión al servidor'
      );
    }));

    it('should show error message in English', fakeAsync(() => {
      translateService.setDefaultLang('en');
      translateService.use('en');

      const mockLoading = {
        present: jasmine.createSpy('present'),
        dismiss: jasmine.createSpy('dismiss')
      } as any;

      loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading));
      sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(false));

      component.loginForm.setValue({
        username: 'test@example.com',
        password: 'password123'
      });

      component.login();
      tick();

      expect(utilsSpy.showAlert).toHaveBeenCalledWith(
        'Authentication Error',
        'No server connection'
      );
    }));

    it('should show invalid credentials message in Spanish', fakeAsync(() => {
      translateService.setDefaultLang('es');
      translateService.use('es');

      const mockLoading = {
        present: jasmine.createSpy('present'),
        dismiss: jasmine.createSpy('dismiss')
      } as any;

      loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading));
      sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
      authServiceSpy.login.and.returnValue(Promise.resolve(false));

      component.loginForm.setValue({
        username: 'test@example.com',
        password: 'wrongpassword'
      });

      component.login();
      tick();

      expect(utilsSpy.showAlert).toHaveBeenCalledWith(
        'Error de Autenticación',
        'Credenciales inválidas'
      );
    }));

    it('should show invalid credentials message in English', fakeAsync(() => {
      translateService.setDefaultLang('en');
      translateService.use('en');

      const mockLoading = {
        present: jasmine.createSpy('present'),
        dismiss: jasmine.createSpy('dismiss')
      } as any;

      loadingControllerSpy.create.and.returnValue(Promise.resolve(mockLoading));
      sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
      authServiceSpy.login.and.returnValue(Promise.resolve(false));

      component.loginForm.setValue({
        username: 'test@example.com',
        password: 'wrongpassword'
      });

      component.login();
      tick();

      expect(utilsSpy.showAlert).toHaveBeenCalledWith(
        'Authentication Error',
        'Invalid credentials'
      );
    }));
  });
});
