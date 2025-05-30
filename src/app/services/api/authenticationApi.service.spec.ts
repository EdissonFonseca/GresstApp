import { TestBed } from '@angular/core/testing';
import { AuthenticationApiService, TokenResponse } from './authenticationApi.service';
import { HttpService } from './http.service';
import { StorageService } from '../core/storage.service';
import { LoggerService } from '../core/logger.service';
import { STORAGE } from '@app/constants/constants';

describe('AuthenticationApiService', () => {
  let service: AuthenticationApiService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockTokenResponse: TokenResponse = {
    AccessToken: 'mock-access-token',
    RefreshToken: 'mock-refresh-token'
  };

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['post', 'get']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get', 'clear']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error', 'info']);

    TestBed.configureTestingModule({
      providers: [
        AuthenticationApiService,
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    });

    service = TestBed.inject(AuthenticationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should successfully login and store tokens', async () => {
      const username = 'test@example.com';
      const password = 'password123';
      httpServiceSpy.post.and.returnValue(Promise.resolve({ status: 200, data: mockTokenResponse }));

      const result = await service.login(username, password);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/authentication/login', {
        Username: username,
        Password: password
      });
      expect(storageServiceSpy.set).toHaveBeenCalledWith(STORAGE.ACCESS_TOKEN, mockTokenResponse.AccessToken);
      expect(storageServiceSpy.set).toHaveBeenCalledWith(STORAGE.REFRESH_TOKEN, mockTokenResponse.RefreshToken);
      expect(storageServiceSpy.set).toHaveBeenCalledWith(STORAGE.USERNAME, username);
    });

    it('should return false on invalid response', async () => {
      httpServiceSpy.post.and.returnValue(Promise.resolve({ status: 200, data: {} }));

      const result = await service.login('test@example.com', 'password123');

      expect(result).toBeFalse();
    });

    it('should handle login error', async () => {
      const error = new Error('Login failed');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.login('test@example.com', 'password123')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Login failed', error);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const password = 'password123';
      httpServiceSpy.post.and.returnValue(Promise.resolve({ status: 200, data: true }));

      const result = await service.register(email, name, password);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/authentication/register', { email, name, password });
    });

    it('should handle registration error', async () => {
      const error = new Error('Registration failed');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.register('test@example.com', 'Test User', 'password123')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Registration failed', error);
    });
  });

  describe('existUser', () => {
    it('should check if user exists', async () => {
      const email = 'test@example.com';
      httpServiceSpy.post.and.returnValue(Promise.resolve({ status: 200, data: true }));

      const result = await service.existUser(email);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/authentication/exist', { email });
    });

    it('should handle existence check error', async () => {
      const error = new Error('User existence check failed');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.existUser('test@example.com')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('User existence check failed', error);
    });
  });

  describe('changeName', () => {
    it('should successfully change user name', async () => {
      const currentPassword = 'current123';
      const newName = 'New Name';
      httpServiceSpy.post.and.returnValue(Promise.resolve({ status: 200, data: true }));

      const result = await service.changeName(currentPassword, newName);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/authentication/change-name', { currentPassword, newName });
    });

    it('should handle name change error', async () => {
      const error = new Error('Name change failed');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.changeName('current123', 'New Name')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Name change failed', error);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const currentPassword = 'current123';
      const newPassword = 'new123';
      httpServiceSpy.post.and.returnValue(Promise.resolve({ status: 200, data: true }));

      const result = await service.changePassword(currentPassword, newPassword);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/authentication/change-password', { currentPassword, newPassword });
    });

    it('should handle password change error', async () => {
      const error = new Error('Password change failed');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.changePassword('current123', 'new123')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Password change failed', error);
    });
  });

  describe('isRefreshTokenValid', () => {
    it('should return true for valid refresh token', async () => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve('valid-refresh-token'),
        Promise.resolve('test@example.com')
      );
      httpServiceSpy.post.and.returnValue(Promise.resolve({ status: 200, data: true }));

      const result = await service.isRefreshTokenValid();

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/authentication/isvalidrefreshtoken', {
        RefreshToken: 'valid-refresh-token',
        Username: 'test@example.com'
      });
    });

    it('should return false when refresh token is missing', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.isRefreshTokenValid();

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });

    it('should return false on validation error', async () => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve('valid-refresh-token'),
        Promise.resolve('test@example.com')
      );
      httpServiceSpy.post.and.returnValue(Promise.reject(new Error('Validation failed')));

      const result = await service.isRefreshTokenValid();

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve('valid-refresh-token'),
        Promise.resolve('test@example.com')
      );
      httpServiceSpy.post.and.returnValue(Promise.resolve({ status: 200, data: mockTokenResponse }));

      const result = await service.refreshToken();

      expect(result).toBeTrue();
      expect(storageServiceSpy.set).toHaveBeenCalledWith(STORAGE.ACCESS_TOKEN, mockTokenResponse.AccessToken);
      expect(storageServiceSpy.set).toHaveBeenCalledWith(STORAGE.REFRESH_TOKEN, mockTokenResponse.RefreshToken);
    });

    it('should return false when refresh token is missing', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.refreshToken();

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });

    it('should handle refresh error and logout', async () => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve('valid-refresh-token'),
        Promise.resolve('test@example.com')
      );
      httpServiceSpy.post.and.returnValue(Promise.reject(new Error('Refresh failed')));

      const result = await service.refreshToken();

      expect(result).toBeFalse();
      expect(storageServiceSpy.clear).toHaveBeenCalled();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear storage on logout', async () => {
      await service.logout();
      expect(storageServiceSpy.clear).toHaveBeenCalled();
    });
  });
});