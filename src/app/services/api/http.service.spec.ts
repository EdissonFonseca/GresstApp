import { TestBed } from '@angular/core/testing';
import { HttpService } from './http.service';
import { Storage } from '@ionic/storage-angular';
import { LoggerService } from '../core/logger.service';
import { CapacitorHttp } from '@capacitor/core';
import { STORAGE } from '@app/constants/constants';
import { jwtDecode } from 'jwt-decode';

describe('HttpService', () => {
  let service: HttpService;
  let storageSpy: jasmine.SpyObj<Storage>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockToken = 'mock.token.here';
  const mockRefreshToken = 'mock.refresh.token';
  const mockUsername = 'test@example.com';
  const mockDecodedToken = { exp: Date.now() / 1000 + 3600 }; // Token expires in 1 hour
  const mockExpiredToken = { exp: Date.now() / 1000 - 3600 }; // Token expired 1 hour ago

  const createMockResponse = (data: any) => ({
    status: 200,
    data,
    headers: {},
    url: 'http://mock.url'
  });

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('Storage', ['get', 'set']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error', 'info', 'warn']);

    TestBed.configureTestingModule({
      providers: [
        HttpService,
        { provide: Storage, useValue: storageSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    });

    service = TestBed.inject(HttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should make a successful GET request without auth', async () => {
      const mockResponse = createMockResponse({ message: 'success' });
      spyOn(CapacitorHttp, 'request').and.returnValue(Promise.resolve(mockResponse));

      const result = await service.get('/authentication/ping');

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.request).toHaveBeenCalledWith({
        url: jasmine.stringMatching(/\/authentication\/ping$/),
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        data: undefined
      });
    });

    it('should make a successful GET request with auth', async () => {
      const mockResponse = createMockResponse({ message: 'success' });
      storageSpy.get.and.returnValue(Promise.resolve(mockToken));
      spyOn(CapacitorHttp, 'request').and.returnValue(Promise.resolve(mockResponse));
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockDecodedToken);

      const result = await service.get('/api/protected');

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.request).toHaveBeenCalledWith({
        url: jasmine.stringMatching(/\/api\/protected$/),
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        data: undefined
      });
    });

    it('should refresh token and retry when token is expired', async () => {
      const mockResponse = createMockResponse({ message: 'success' });
      const mockTokenResponse = createMockResponse({
        AccessToken: 'new.token.here',
        RefreshToken: 'new.refresh.token'
      });

      storageSpy.get.and.returnValues(
        Promise.resolve(mockToken),
        Promise.resolve(mockRefreshToken),
        Promise.resolve(mockUsername)
      );
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockExpiredToken);
      spyOn(CapacitorHttp, 'request').and.returnValues(
        Promise.reject({ status: 401 }),
        Promise.resolve(mockTokenResponse),
        Promise.resolve(mockResponse)
      );

      const result = await service.get('/api/protected');

      expect(result).toEqual(mockResponse);
      expect(storageSpy.set).toHaveBeenCalledWith(STORAGE.ACCESS_TOKEN, 'new.token.here');
      expect(storageSpy.set).toHaveBeenCalledWith(STORAGE.REFRESH_TOKEN, 'new.refresh.token');
    });

    it('should retry on retryable errors', async () => {
      const mockResponse = createMockResponse({ message: 'success' });
      storageSpy.get.and.returnValue(Promise.resolve(mockToken));
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockDecodedToken);
      spyOn(CapacitorHttp, 'request').and.returnValues(
        Promise.reject({ status: 500 }),
        Promise.resolve(mockResponse)
      );

      const result = await service.get('/api/protected');

      expect(result).toEqual(mockResponse);
      expect(loggerServiceSpy.warn).toHaveBeenCalled();
    });

    it('should throw error after max retries', async () => {
      const error = { status: 500, message: 'Server error' };
      storageSpy.get.and.returnValue(Promise.resolve(mockToken));
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockDecodedToken);
      spyOn(CapacitorHttp, 'request').and.returnValue(Promise.reject(error));

      await expectAsync(service.get('/api/protected')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('post', () => {
    it('should make a successful POST request', async () => {
      const mockData = { name: 'test' };
      const mockResponse = createMockResponse({ message: 'success' });
      storageSpy.get.and.returnValue(Promise.resolve(mockToken));
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockDecodedToken);
      spyOn(CapacitorHttp, 'request').and.returnValue(Promise.resolve(mockResponse));

      const result = await service.post('/api/test', mockData);

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.request).toHaveBeenCalledWith({
        url: jasmine.stringMatching(/\/api\/test$/),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        data: mockData
      });
    });
  });

  describe('put', () => {
    it('should make a successful PUT request', async () => {
      const mockData = { name: 'test' };
      const mockResponse = createMockResponse({ message: 'success' });
      storageSpy.get.and.returnValue(Promise.resolve(mockToken));
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockDecodedToken);
      spyOn(CapacitorHttp, 'request').and.returnValue(Promise.resolve(mockResponse));

      const result = await service.put('/api/test', mockData);

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.request).toHaveBeenCalledWith({
        url: jasmine.stringMatching(/\/api\/test$/),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        data: mockData
      });
    });
  });

  describe('delete', () => {
    it('should make a successful DELETE request', async () => {
      const mockResponse = createMockResponse({ message: 'success' });
      storageSpy.get.and.returnValue(Promise.resolve(mockToken));
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockDecodedToken);
      spyOn(CapacitorHttp, 'request').and.returnValue(Promise.resolve(mockResponse));

      const result = await service.delete('/api/test');

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.request).toHaveBeenCalledWith({
        url: jasmine.stringMatching(/\/api\/test$/),
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        data: undefined
      });
    });
  });

  describe('token refresh', () => {
    it('should handle token refresh failure', async () => {
      const error = { status: 401, message: 'Invalid refresh token' };
      storageSpy.get.and.returnValues(
        Promise.resolve(mockToken),
        Promise.resolve(mockRefreshToken),
        Promise.resolve(mockUsername)
      );
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockExpiredToken);
      spyOn(CapacitorHttp, 'request').and.returnValues(
        Promise.reject({ status: 401 }),
        Promise.reject(error)
      );

      await expectAsync(service.get('/api/protected')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });

    it('should prevent multiple simultaneous token refreshes', async () => {
      const mockResponse = createMockResponse({ message: 'success' });
      storageSpy.get.and.returnValues(
        Promise.resolve(mockToken),
        Promise.resolve(mockRefreshToken),
        Promise.resolve(mockUsername)
      );
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockExpiredToken);
      spyOn(CapacitorHttp, 'request').and.returnValues(
        Promise.reject({ status: 401 }),
        Promise.resolve(mockResponse)
      );

      // Make multiple concurrent requests
      const requests = [
        service.get('/api/protected'),
        service.get('/api/protected'),
        service.get('/api/protected')
      ];

      const results = await Promise.all(requests);
      expect(results.every(r => r.status === 200)).toBeTrue();
      expect(CapacitorHttp.request).toHaveBeenCalledTimes(2); // One refresh + one retry
    });
  });
});
