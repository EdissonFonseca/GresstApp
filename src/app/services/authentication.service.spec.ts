import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';
import { CapacitorHttp } from '@capacitor/core';

interface TokenResponse {
  AccessToken: string;
  RefreshToken: string;
}

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let storageService: StorageService;

  const mockTokenResponse: TokenResponse = {
    AccessToken: 'test-access-token',
    RefreshToken: 'test-refresh-token'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        StorageService
      ]
    });

    service = TestBed.inject(AuthenticationService);
    storageService = TestBed.inject(StorageService);

    // Clear storage before each test
    spyOn(storageService, 'clear');
    spyOn(storageService, 'set');
    spyOn(storageService, 'get').and.returnValue(Promise.resolve(null));
  });

  afterEach(() => {
    // Limpiar todos los mocks después de cada prueba
    (storageService.clear as jasmine.Spy).calls.reset();
    (storageService.set as jasmine.Spy).calls.reset();
    (storageService.get as jasmine.Spy).calls.reset();
  });

  afterAll(() => {
    // Limpiar el TestBed después de todas las pruebas
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('ping', () => {
    it('should return true when server is reachable', fakeAsync(() => {
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 200,
        data: {},
        headers: {},
        url: ''
      }));

      let result = false;
      service.ping().then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(CapacitorHttp.get).toHaveBeenCalledWith(jasmine.objectContaining({
        url: `${environment.apiUrl}/authentication/ping`
      }));
    }));

    it('should return false when server is not reachable', fakeAsync(() => {
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.reject(new Error('Network error')));

      let result = true;
      service.ping().then(res => result = res);
      tick();

      expect(result).toBeFalse();
    }));
  });

  describe('login', () => {
    const username = 'test@example.com';
    const password = 'password123';

    it('should return true and store tokens on successful login', fakeAsync(() => {
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 200,
        data: mockTokenResponse,
        headers: {},
        url: ''
      }));

      let result = false;
      service.login(username, password).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(storageService.set).toHaveBeenCalledWith('Login', username);
      expect(storageService.set).toHaveBeenCalledWith('AccessToken', mockTokenResponse.AccessToken);
      expect(storageService.set).toHaveBeenCalledWith('RefreshToken', mockTokenResponse.RefreshToken);
    }));

    it('should return false on failed login', fakeAsync(() => {
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 401,
        data: {},
        headers: {},
        url: ''
      }));

      let result = true;
      service.login(username, password).then(res => result = res);
      tick();

      expect(result).toBeFalse();
      expect(storageService.set).not.toHaveBeenCalled();
    }));
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      spyOn(storageService, 'get').and.callFake((key: string) => {
        if (key === 'Login') return Promise.resolve('test@example.com');
        if (key === 'RefreshToken') return Promise.resolve('old-refresh-token');
        return Promise.resolve(null);
      });
    });

    it('should return true and update tokens on successful refresh', fakeAsync(() => {
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 200,
        data: mockTokenResponse,
        headers: {},
        url: ''
      }));

      let result = false;
      service.refreshToken().then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(storageService.set).toHaveBeenCalledWith('AccessToken', mockTokenResponse.AccessToken);
      expect(storageService.set).toHaveBeenCalledWith('RefreshToken', mockTokenResponse.RefreshToken);
    }));

    it('should return false when refresh token is missing', fakeAsync(() => {
      spyOn(storageService, 'get').and.returnValue(Promise.resolve(null));

      let result = true;
      service.refreshToken().then(res => result = res);
      tick();

      expect(result).toBeFalse();
      expect(storageService.set).not.toHaveBeenCalled();
    }));

    it('should return false on failed refresh', fakeAsync(() => {
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 401,
        data: {},
        headers: {},
        url: ''
      }));

      let result = true;
      service.refreshToken().then(res => result = res);
      tick();

      expect(result).toBeFalse();
      expect(storageService.set).not.toHaveBeenCalled();
    }));
  });

  describe('restoreSession', () => {
    beforeEach(() => {
      spyOn(service, 'refreshToken').and.returnValue(Promise.resolve(true));
      spyOn(service, 'ping').and.returnValue(Promise.resolve(true));
    });

    it('should return true when online and refresh successful', fakeAsync(() => {
      let result = false;
      service.restoreSession().then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(service.refreshToken).toHaveBeenCalled();
    }));

    it('should return false when online but refresh fails', fakeAsync(() => {
      (service.refreshToken as jasmine.Spy).and.returnValue(Promise.resolve(false));

      let result = true;
      service.restoreSession().then(res => result = res);
      tick();

      expect(result).toBeFalse();
    }));

    it('should return false when offline', fakeAsync(() => {
      (service.ping as jasmine.Spy).and.returnValue(Promise.resolve(false));

      let result = true;
      service.restoreSession().then(res => result = res);
      tick();

      expect(result).toBeFalse();
      expect(service.refreshToken).not.toHaveBeenCalled();
    }));
  });

  describe('logout', () => {
    it('should clear storage', fakeAsync(() => {
      service.logout();
      tick();

      expect(storageService.clear).toHaveBeenCalled();
    }));
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', fakeAsync(() => {
      spyOn(storageService, 'get').and.returnValue(Promise.resolve('valid-token'));

      let result = false;
      service.isAuthenticated().then(res => result = res);
      tick();

      expect(result).toBeTrue();
    }));

    it('should return false when access token is missing', fakeAsync(() => {
      spyOn(storageService, 'get').and.returnValue(Promise.resolve(null));

      let result = true;
      service.isAuthenticated().then(res => result = res);
      tick();

      expect(result).toBeFalse();
    }));
  });

  describe('isPublicEndpoint', () => {
    it('should return true for public endpoints', () => {
      const result = service.isPublicEndpoint('/authentication/login');
      expect(result).toBeTrue();
    });

    it('should return false for protected endpoints', () => {
      const result = service.isPublicEndpoint('/api/protected');
      expect(result).toBeFalse();
    });
  });
});

