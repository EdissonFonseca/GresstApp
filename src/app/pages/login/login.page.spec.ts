import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SessionService } from '@app/services/core/session.service';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateService: TranslateService;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthenticationApiService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const sessionSpy = jasmine.createSpyObj('SessionService', ['isOnline', 'start', 'hasPendingRequests', 'uploadData']);
    const notificationSpy = jasmine.createSpyObj('UserNotificationService', [
      'showLoading',
      'hideLoading',
      'showAlert',
      'showConfirm'
    ]);

    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        ReactiveFormsModule,
        IonicModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        { provide: AuthenticationApiService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: SessionService, useValue: sessionSpy },
        { provide: UserNotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthenticationApiService) as jasmine.SpyObj<AuthenticationApiService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    userNotificationServiceSpy = TestBed.inject(UserNotificationService) as jasmine.SpyObj<UserNotificationService>;
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
    passwordControl?.setValue('1234');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();

    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should handle successful login with no pending requests', fakeAsync(() => {
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.hasPendingRequests.and.returnValue(Promise.resolve(false));
    sessionServiceSpy.start.and.returnValue(Promise.resolve(true));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'password123'
    });

    component.login();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.isOnline).toHaveBeenCalled();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(sessionServiceSpy.hasPendingRequests).toHaveBeenCalled();
    expect(sessionServiceSpy.start).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle successful login with pending requests', fakeAsync(() => {
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.hasPendingRequests.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.uploadData.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.start.and.returnValue(Promise.resolve(true));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'password123'
    });

    component.login();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.isOnline).toHaveBeenCalled();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(sessionServiceSpy.hasPendingRequests).toHaveBeenCalled();
    expect(sessionServiceSpy.uploadData).toHaveBeenCalled();
    expect(sessionServiceSpy.start).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle offline state', fakeAsync(() => {
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(false));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'password123'
    });

    component.login();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.isOnline).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showAlert).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle invalid credentials', fakeAsync(() => {
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve(false));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'wrongpassword'
    });

    component.login();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.isOnline).toHaveBeenCalled();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(userNotificationServiceSpy.showAlert).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle sync error with user confirmation', fakeAsync(() => {
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.hasPendingRequests.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.uploadData.and.returnValue(Promise.resolve(false));
    userNotificationServiceSpy.showConfirm.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.start.and.returnValue(Promise.resolve(true));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'password123'
    });

    component.login();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.isOnline).toHaveBeenCalled();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(sessionServiceSpy.hasPendingRequests).toHaveBeenCalled();
    expect(sessionServiceSpy.uploadData).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showConfirm).toHaveBeenCalled();
    expect(sessionServiceSpy.start).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle sync error without user confirmation', fakeAsync(() => {
    sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(true));
    authServiceSpy.login.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.hasPendingRequests.and.returnValue(Promise.resolve(true));
    sessionServiceSpy.uploadData.and.returnValue(Promise.resolve(false));
    userNotificationServiceSpy.showConfirm.and.returnValue(Promise.resolve(false));

    component.loginForm.setValue({
      username: 'test@example.com',
      password: 'password123'
    });

    component.login();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(sessionServiceSpy.isOnline).toHaveBeenCalled();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(sessionServiceSpy.hasPendingRequests).toHaveBeenCalled();
    expect(sessionServiceSpy.uploadData).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showConfirm).toHaveBeenCalled();
    expect(sessionServiceSpy.start).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle password recovery navigation', fakeAsync(() => {
    component.recoverPassword();
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/register-email']);
  }));

  describe('Translation Tests', () => {
    it('should show error message in Spanish', fakeAsync(() => {
      translateService.setDefaultLang('es');
      translateService.use('es');

      sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(false));

      component.loginForm.setValue({
        username: 'test@example.com',
        password: 'password123'
      });

      component.login();
      tick();

      expect(userNotificationServiceSpy.showAlert).toHaveBeenCalledWith(
        'AUTH.ERRORS.NO_CONNECTION_TITLE',
        'AUTH.ERRORS.NO_CONNECTION_MESSAGE'
      );
    }));

    it('should show error message in English', fakeAsync(() => {
      translateService.setDefaultLang('en');
      translateService.use('en');

      sessionServiceSpy.isOnline.and.returnValue(Promise.resolve(false));

      component.loginForm.setValue({
        username: 'test@example.com',
        password: 'password123'
      });

      component.login();
      tick();

      expect(userNotificationServiceSpy.showAlert).toHaveBeenCalledWith(
        'AUTH.ERRORS.NO_CONNECTION_TITLE',
        'AUTH.ERRORS.NO_CONNECTION_MESSAGE'
      );
    }));
  });
});
