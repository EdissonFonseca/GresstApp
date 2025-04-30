import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { StorageService } from 'src/app/services/storage.service';
import { SynchronizationService } from 'src/app/services/synchronization.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let globalesSpy: jasmine.SpyObj<GlobalesService>;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;

  beforeEach(waitForAsync(() => {
    // Create spies for all dependencies
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['ping', 'login']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    globalesSpy = jasmine.createSpyObj('GlobalesService', ['showLoading', 'hideLoading', 'presentAlert', 'presentToast', 'initGlobales'], {
      estaCerrando: false,
      token: ''
    });
    storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    syncServiceSpy = jasmine.createSpyObj('SynchronizationService', ['refresh', 'load']);

    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: GlobalesService, useValue: globalesSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: SynchronizationService, useValue: syncServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty username and password', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
  });

  it('should show alert when login with empty credentials', async () => {
    await component.login();
    expect(globalesSpy.presentAlert).toHaveBeenCalledWith('Error', '', 'Debe digitar usuario y contrasena');
  });

  it('should attempt login when credentials are provided', async () => {
    // Setup
    component.username = 'test@example.com';
    component.password = 'password123';
    authServiceSpy.ping.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve('mock-token'));

    // Execute
    await component.login();

    // Verify
    expect(globalesSpy.showLoading).toHaveBeenCalledWith('Conectando ...');
    expect(authServiceSpy.ping).toHaveBeenCalled();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(storageSpy.set).toHaveBeenCalledWith('Login', 'test@example.com');
    expect(storageSpy.set).toHaveBeenCalledWith('Password', 'password123');
    expect(storageSpy.set).toHaveBeenCalledWith('Token', 'mock-token');
    expect(globalesSpy.initGlobales).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/home');
  });

  it('should handle server offline scenario', async () => {
    // Setup
    component.username = 'test@example.com';
    component.password = 'password123';
    authServiceSpy.ping.and.returnValue(Promise.resolve(false));

    // Execute
    await component.login();

    // Verify
    expect(globalesSpy.presentAlert).toHaveBeenCalledWith('Error', 'Sin conexión', 'No se puede conectar al servidor.');
  });

  it('should handle invalid credentials', async () => {
    // Setup
    component.username = 'test@example.com';
    component.password = 'wrongpassword';
    authServiceSpy.ping.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve(''));

    // Execute
    await component.login();

    // Verify
    expect(globalesSpy.presentAlert).toHaveBeenCalledWith('Error', 'Usuario no autorizado', 'Usuario o contraseña no válido.');
  });

  it('should handle login error', async () => {
    // Setup
    component.username = 'test@example.com';
    component.password = 'password123';
    authServiceSpy.ping.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.reject(new Error('Network error')));

    // Execute
    await component.login();

    // Verify
    expect(globalesSpy.presentAlert).toHaveBeenCalledWith('Error', 'Request Error', 'Network error');
  });

  it('should navigate to password recovery page', () => {
    component.goPassword();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('contrasena-correo');
  });

  it('should handle auto-login with stored credentials', async () => {
    // Setup
    storageSpy.get.and.returnValue(Promise.resolve('test@example.com'));
    authServiceSpy.ping.and.returnValue(Promise.resolve(true));
    syncServiceSpy.refresh.and.returnValue(Promise.resolve(true));

    // Execute
    await component.ngOnInit();

    // Verify
    expect(authServiceSpy.ping).toHaveBeenCalled();
    expect(syncServiceSpy.refresh).toHaveBeenCalled();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/home');
  });
});
