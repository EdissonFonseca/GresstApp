import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoginPage } from './login.page';
import { AuthenticationService } from '../../services/authentication.service';
import { SynchronizationService } from '../../services/synchronization.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthenticationService', [
      'login',
      'restoreSession',
      'ping'
    ]);
    const syncSpy = jasmine.createSpyObj('SynchronizationService', [
      'refresh',
      'load'
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: AuthenticationService, useValue: authSpy },
        { provide: SynchronizationService, useValue: syncSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: ToastController, useValue: toastSpy },
        { provide: AlertController, useValue: alertSpy }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    syncServiceSpy = TestBed.inject(SynchronizationService) as jasmine.SpyObj<SynchronizationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loadingControllerSpy = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    toastControllerSpy = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;

    // Mock loading controller
    const loadingElementSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    loadingControllerSpy.create.and.returnValue(Promise.resolve(loadingElementSpy));

    // Mock toast controller
    const toastElementSpy = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastElementSpy));

    // Mock alert controller
    const alertElementSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertElementSpy));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize the login form', () => {
      expect(component.loginForm).toBeTruthy();
      expect(component.loginForm.get('username')).toBeTruthy();
      expect(component.loginForm.get('password')).toBeTruthy();
    });

    it('should call checkSession on init', () => {
      spyOn(component, 'checkSession');
      component.ngOnInit();
      expect(component.checkSession).toHaveBeenCalled();
    });
  });

  describe('checkSession', () => {
    it('should navigate to home if session is restored and online', fakeAsync(() => {
      authServiceSpy.ping.and.returnValue(Promise.resolve(true));
      authServiceSpy.restoreSession.and.returnValue(Promise.resolve(true));
      syncServiceSpy.refresh.and.returnValue(Promise.resolve(true));

      component.checkSession();
      tick();

      expect(authServiceSpy.ping).toHaveBeenCalled();
      expect(authServiceSpy.restoreSession).toHaveBeenCalled();
      expect(syncServiceSpy.refresh).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should show offline message when no connection', fakeAsync(() => {
      authServiceSpy.ping.and.returnValue(Promise.resolve(false));

      component.checkSession();
      tick();

      expect(toastControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Está trabajando sin conexión',
          position: 'middle'
        })
      );
    }));

    it('should not navigate if session restoration fails', fakeAsync(() => {
      authServiceSpy.ping.and.returnValue(Promise.resolve(true));
      authServiceSpy.restoreSession.and.returnValue(Promise.resolve(false));

      component.checkSession();
      tick();

      expect(authServiceSpy.restoreSession).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('login', () => {
    const validCredentials = {
      username: 'test@example.com',
      password: 'password123'
    };

    beforeEach(() => {
      component.loginForm.patchValue(validCredentials);
    });

    it('should not proceed if form is invalid', fakeAsync(() => {
      component.loginForm.setErrors({ invalid: true });
      component.login();
      tick();
      expect(authServiceSpy.login).not.toHaveBeenCalled();
    }));

    it('should show error when offline', fakeAsync(() => {
      authServiceSpy.ping.and.returnValue(Promise.resolve(false));

      component.login();
      tick();

      expect(alertControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Error',
          message: 'No se puede iniciar sesión sin conexión'
        })
      );
    }));

    it('should navigate to home on successful login and data load', fakeAsync(() => {
      authServiceSpy.ping.and.returnValue(Promise.resolve(true));
      authServiceSpy.login.and.returnValue(Promise.resolve(true));
      syncServiceSpy.load.and.returnValue(Promise.resolve(true));

      component.login();
      tick();

      expect(authServiceSpy.login).toHaveBeenCalledWith(
        validCredentials.username,
        validCredentials.password
      );
      expect(syncServiceSpy.load).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should show warning toast when data load fails', fakeAsync(() => {
      authServiceSpy.ping.and.returnValue(Promise.resolve(true));
      authServiceSpy.login.and.returnValue(Promise.resolve(true));
      syncServiceSpy.load.and.returnValue(Promise.resolve(false));

      component.login();
      tick();

      expect(toastControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'No se pudieron cargar todos los datos',
          position: 'middle'
        })
      );
    }));

    it('should show error message on failed login', fakeAsync(() => {
      authServiceSpy.ping.and.returnValue(Promise.resolve(true));
      authServiceSpy.login.and.returnValue(Promise.resolve(false));

      component.login();
      tick();

      expect(alertControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Error de autenticación',
          message: 'Credenciales inválidas'
        })
      );
    }));

    it('should handle server connection error', fakeAsync(() => {
      authServiceSpy.ping.and.returnValue(Promise.resolve(true));
      authServiceSpy.login.and.returnValue(Promise.reject({ status: 0 }));

      component.login();
      tick();

      expect(alertControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Error',
          message: 'No se pudo conectar con el servidor'
        })
      );
    }));
  });

  describe('recoverPassword', () => {
    it('should show error when no email provided', fakeAsync(() => {
      component.loginForm.patchValue({ username: '' });
      component.recoverPassword();
      tick();

      expect(alertControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Error',
          message: 'Por favor ingrese su correo electrónico'
        })
      );
    }));

    it('should show error when offline', fakeAsync(() => {
      component.loginForm.patchValue({ username: 'test@example.com' });
      authServiceSpy.ping.and.returnValue(Promise.resolve(false));

      component.recoverPassword();
      tick();

      expect(alertControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Error',
          message: 'No se puede recuperar la contraseña sin conexión'
        })
      );
    }));

    it('should show success message when online', fakeAsync(() => {
      component.loginForm.patchValue({ username: 'test@example.com' });
      authServiceSpy.ping.and.returnValue(Promise.resolve(true));

      component.recoverPassword();
      tick();

      expect(alertControllerSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Éxito',
          message: 'Se ha enviado un correo con las instrucciones'
        })
      );
    }));
  });

  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should be invalid with invalid email', () => {
      component.loginForm.patchValue({
        username: 'invalid-email',
        password: 'password123'
      });
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should be invalid with short password', () => {
      component.loginForm.patchValue({
        username: 'test@example.com',
        password: '12345'
      });
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should be valid with correct credentials', () => {
      component.loginForm.patchValue({
        username: 'test@example.com',
        password: 'password123'
      });
      expect(component.loginForm.valid).toBeTruthy();
    });
  });
});
