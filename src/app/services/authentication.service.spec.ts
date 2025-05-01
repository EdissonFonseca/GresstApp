import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let storageService: StorageService;

  const mockTokenResponse: TokenResponse = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthenticationService,
        StorageService
      ]
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService);

    // Clear storage before each test
    spyOn(storageService, 'clear');
    spyOn(storageService, 'set');
    spyOn(storageService, 'get').and.returnValue(Promise.resolve(null));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('ping', () => {
    it('should return true when server is reachable', () => {
      service.ping().then(result => {
        expect(result).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/ping`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });

    it('should return false when server is not reachable', () => {
      service.ping().then(result => {
        expect(result).toBeFalse();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/ping`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('login', () => {
    const username = 'test@example.com';
    const password = 'password123';

    it('should return true and store tokens on successful login', () => {
      service.login(username, password).then(result => {
        expect(result).toBeTrue();
        expect(storageService.set).toHaveBeenCalledWith('accessToken', mockTokenResponse.accessToken);
        expect(storageService.set).toHaveBeenCalledWith('refreshToken', mockTokenResponse.refreshToken);
        expect(storageService.set).toHaveBeenCalledWith('username', username);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush(mockTokenResponse);
    });

    it('should return false on failed login', () => {
      service.login(username, password).then(result => {
        expect(result).toBeFalse();
        expect(storageService.set).not.toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.error(new ErrorEvent('Unauthorized'));
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      spyOn(storageService, 'get').and.callFake((key: string) => {
        if (key === 'username') return Promise.resolve('test@example.com');
        if (key === 'refreshToken') return Promise.resolve('old-refresh-token');
        return Promise.resolve(null);
      });
    });

    it('should return true and update tokens on successful refresh', () => {
      service.refreshToken().then(result => {
        expect(result).toBeTrue();
        expect(storageService.set).toHaveBeenCalledWith('accessToken', mockTokenResponse.accessToken);
        expect(storageService.set).toHaveBeenCalledWith('refreshToken', mockTokenResponse.refreshToken);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'test@example.com',
        refreshToken: 'old-refresh-token'
      });
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush(mockTokenResponse);
    });

    it('should return false when refresh token is missing', () => {
      spyOn(storageService, 'get').and.returnValue(Promise.resolve(null));

      service.refreshToken().then(result => {
        expect(result).toBeFalse();
        expect(storageService.set).not.toHaveBeenCalled();
      });
    });

    it('should return false on failed refresh', () => {
      service.refreshToken().then(result => {
        expect(result).toBeFalse();
        expect(storageService.set).not.toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.error(new ErrorEvent('Unauthorized'));
    });
  });

  describe('restoreSession', () => {
    beforeEach(() => {
      spyOn(service, 'refreshToken').and.returnValue(Promise.resolve(true));
      spyOn(service, 'ping').and.returnValue(Promise.resolve(true));
    });

    it('should return true when online and refresh successful', () => {
      service.restoreSession().then(result => {
        expect(result).toBeTrue();
        expect(service.refreshToken).toHaveBeenCalled();
      });
    });

    it('should return false when online but refresh fails', () => {
      (service.refreshToken as jasmine.Spy).and.returnValue(Promise.resolve(false));

      service.restoreSession().then(result => {
        expect(result).toBeFalse();
      });
    });

    it('should return false when offline', () => {
      (service.ping as jasmine.Spy).and.returnValue(Promise.resolve(false));

      service.restoreSession().then(result => {
        expect(result).toBeFalse();
        expect(service.refreshToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    it('should clear storage and return true', () => {
      service.logout().then(result => {
        expect(result).toBeTrue();
        expect(storageService.clear).toHaveBeenCalled();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      spyOn(storageService, 'get').and.returnValue(Promise.resolve('valid-token'));

      service.isAuthenticated().then(result => {
        expect(result).toBeTrue();
      });
    });

    it('should return false when access token is missing', () => {
      spyOn(storageService, 'get').and.returnValue(Promise.resolve(null));

      service.isAuthenticated().then(result => {
        expect(result).toBeFalse();
      });
    });
  });

  describe('protected endpoint', () => {
    it('should include Authorization header for protected endpoints', () => {
      const mockToken = 'test-token';
      spyOn(storageService, 'get').and.returnValue(Promise.resolve(mockToken));

      service['http'].get(`${environment.apiUrl}/api/protected`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/protected`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });
  });
});

