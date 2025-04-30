import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { GlobalesService } from './globales.service';
import { StorageService } from './storage.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let globales: GlobalesService;
  let storage: StorageService;

  beforeEach(() => {
    globales = { token: '' } as GlobalesService;
    storage = { set: jasmine.createSpy('set'), get: jasmine.createSpy('get') } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: GlobalesService, useValue: globales },
        { provide: StorageService, useValue: storage },
      ],
    });

    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should ping the server and return true if successful', async () => {
    const mockResponse: HttpResponse = { status: 200, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.ping();
    expect(result).toBeTrue();
  });

  it('should ping the server and return false if not successful', async () => {
    const mockResponse: HttpResponse = { status: 500, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.ping();
    expect(result).toBeFalse();
  });

  it('should ping the server and return false on error', async () => {
    spyOn(CapacitorHttp, 'get').and.returnValue(Promise.reject(new Error('Network error')));

    const result = await service.ping();
    expect(result).toBeFalse();
  });

  it('should validate token and return true if token is valid', async () => {
    globales.token = 'valid-token';
    const mockResponse: HttpResponse = { status: 200, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.validateToken();
    expect(result).toBeTrue();
  });

  it('should validate token and return false if token is invalid', async () => {
    globales.token = 'invalid-token';
    const mockResponse: HttpResponse = { status: 401, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.validateToken();
    expect(result).toBeFalse();
  });

  it('should validate token and throw error on network error', async () => {
    globales.token = 'valid-token';
    spyOn(CapacitorHttp, 'get').and.returnValue(Promise.reject(new Error('Network error')));

    await expectAsync(service.validateToken()).toBeRejectedWithError('Request error: Network error');
  });

  it('should login successfully and return token', async () => {
    const mockResponse: HttpResponse = { status: 200, data: 'mocked-token', headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.login('testuser', 'testpassword');
    expect(result).toBe('mocked-token');
  });

  it('should throw error if login fails', async () => {
    const mockResponse: HttpResponse = { status: 401, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    await expectAsync(service.login('testuser', 'wrongpassword')).toBeRejectedWithError('Usuario no autorizado');
  });

  it('should throw error on network error during login', async () => {
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.reject(new Error('Network error')));

    await expectAsync(service.login('testuser', 'testpassword')).toBeRejectedWithError('Error durante el inicio de sesión: Network error');
  });

  it('should check if a user exists and return true', async () => {
    const mockResponse: HttpResponse = { status: 200, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.existUser('test@example.com');
    expect(result).toBeTrue();
  });

  it('should check if a user exists and return false', async () => {
    const mockResponse: HttpResponse = { status: 404, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.existUser('nonexistent@example.com');
    expect(result).toBeFalse();
  });

  it('should throw error when checking user existence fails', async () => {
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.reject(new Error('Network error')));

    await expectAsync(service.existUser('test@example.com')).toBeRejectedWithError('Usuario no existe');
  });

  it('should change name successfully', async () => {
    const mockResponse: HttpResponse = { status: 200, data: 'Name changed successfully', headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.changeName('test@example.com', 'New Name');
    expect(result).toBe('Name changed successfully');
  });

  it('should throw error when changing name fails', async () => {
    const mockResponse: HttpResponse = { status: 500, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    await expectAsync(service.changeName('test@example.com', 'New Name')).toBeRejectedWithError('Response Status 500');
  });

  it('should change password successfully', async () => {
    const mockResponse: HttpResponse = { status: 200, data: 'Password changed successfully', headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.changePassword('test@example.com', 'newpassword');
    expect(result).toBe('Password changed successfully');
  });

  it('should throw error when changing password fails', async () => {
    const mockResponse: HttpResponse = { status: 500, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    await expectAsync(service.changePassword('test@example.com', 'newpassword')).toBeRejectedWithError('Response Status 500');
  });

  it('should register user successfully', async () => {
    const mockResponse: HttpResponse = { status: 200, data: 'User registered successfully', headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.register('test@example.com', 'Test User', 'password123');
    expect(result).toBe('User registered successfully');
  });

  it('should throw error when registration fails', async () => {
    const mockResponse: HttpResponse = { status: 500, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    await expectAsync(service.register('test@example.com', 'Test User', 'password123')).toBeRejectedWithError('Response Status 500');
  });
});
