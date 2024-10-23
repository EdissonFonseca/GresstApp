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
    globales = { token: '' } as GlobalesService; // Mock de Globales
    storage = { set: jasmine.createSpy('set'), get: jasmine.createSpy('get') } as any; // Mock de StorageService

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: GlobalesService, useValue: globales },
        { provide: StorageService, useValue: storage },
      ],
    });

    service = TestBed.inject(AuthenticationService);
  });

  it('should ping the server and return true if successful', async () => {
    const mockResponse: HttpResponse = { status: 200, data: {}, headers: {}, url: '' };
    spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.ping();
    expect(result).toBeTrue();
  });

  // it('should ping the server and return false if not successful', async () => {
  //   const mockResponse: HttpResponse = { status: 500, data: {}, headers: {}, url: '' };
  //   spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve(mockResponse));

  //   const result = await service.ping();
  //   expect(result).toBeFalse();
  // });

  // it('should validate token and return true if token is valid', async () => {
  //   globales.token = 'valid-token';
  //   const mockResponse: HttpResponse = { status: 200, data: {}, headers: {}, url: '' };
  //   spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve(mockResponse));

  //   const result = await service.validateToken();
  //   expect(result).toBeTrue();
  // });

  // it('should validate token and return false if token is invalid', async () => {
  //   globales.token = 'invalid-token';
  //   const mockResponse: HttpResponse = { status: 401, data: {}, headers: {}, url: '' };
  //   spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve(mockResponse));

  //   const result = await service.validateToken();
  //   expect(result).toBeFalse();
  // });

  it('should login successfully and return token', async () => {
    const mockResponse: HttpResponse = { status: 200, data: 'mocked-token', headers: {}, url: '' };

    spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

    const result = await service.login('testuser', 'testpassword');
    expect(result).toBe('mocked-token');
    expect(globales.token).toBe('mocked-token');
    expect(storage.set).toHaveBeenCalledWith('Token', 'mocked-token');
  });

  // it('should throw an error if login fails', async () => {
  //   const mockResponse: HttpResponse = { status: 401, data: {}, headers: {}, url: '' };
  //   spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

  //   await expectAsync(service.login('testuser', 'wrongpassword')).toBeRejectedWithError('Usuario no autorizado');
  // });

  // it('should check if a user exists and return true', async () => {
  //   const mockResponse: HttpResponse = { status: 200, data: {}, headers: {}, url: '' };
  //   spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

  //   const result = await service.existUser('test@example.com');
  //   expect(result).toBeTrue();
  // });

  // it('should check if a user exists and return false', async () => {
  //   const mockResponse: HttpResponse = { status: 404, data: {}, headers: {}, url: '' };
  //   spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

  //   const result = await service.existUser('nonexistent@example.com');
  //   expect(result).toBeFalse();
  // });

  // it('should change name successfully', async () => {
  //   const mockResponse: HttpResponse = { status: 200, data: 'Name changed successfully', headers: {}, url: '' };
  //   spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

  //   const result = await service.changeName('test@example.com', 'New Name');
  //   expect(result).toEqual(mockResponse.data);
  // });

  // it('should throw an error when changing name fails', async () => {
  //   const mockResponse: HttpResponse = { status: 500, data: {}, headers: {}, url: '' };
  //   spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

  //   await expectAsync(service.changeName('test@example.com', 'New Name')).toBeRejectedWithError('Response Status 500');
  // });
});
