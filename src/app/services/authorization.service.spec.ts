import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthorizationService } from './authorization.service';
import { AuthenticationService } from './authentication.service';
import { CapacitorHttp } from '@capacitor/core';
import { environment } from '../../environments/environment';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let authService: jasmine.SpyObj<AuthenticationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthenticationService', ['getAccessToken']);

    TestBed.configureTestingModule({
      providers: [
        AuthorizationService,
        { provide: AuthenticationService, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthorizationService);
    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
  });

  afterEach(() => {
    // Limpiar todos los mocks después de cada prueba
    authService.getAccessToken.calls.reset();
  });

  afterAll(() => {
    // Limpiar el TestBed después de todas las pruebas
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    const mockToken = 'test-token';
    const mockResponse = { data: 'test-data' };

    it('should return data when request is successful', fakeAsync(() => {
      authService.getAccessToken.and.returnValue(Promise.resolve(mockToken));
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 200,
        data: mockResponse,
        headers: {},
        url: ''
      }));

      let result: any;
      service.get().then(res => result = res);
      tick();

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.get).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/authorization/get/app`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        webFetchExtra: {
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit'
        }
      });
    }));

    it('should throw error when no access token is available', fakeAsync(() => {
      authService.getAccessToken.and.returnValue(Promise.resolve(null));

      let error: any;
      service.get().catch(err => error = err);
      tick();

      expect(error.message).toBe('No access token available');
      expect(CapacitorHttp.get).not.toHaveBeenCalled();
    }));

    it('should throw error when request fails', fakeAsync(() => {
      authService.getAccessToken.and.returnValue(Promise.resolve(mockToken));
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 401,
        data: {},
        headers: {},
        url: ''
      }));

      let error: any;
      service.get().catch(err => error = err);
      tick();

      expect(error.message).toBe('Request error');
    }));

    it('should throw error when network request fails', fakeAsync(() => {
      authService.getAccessToken.and.returnValue(Promise.resolve(mockToken));
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.reject(new Error('Network error')));

      let error: any;
      service.get().catch(err => error = err);
      tick();

      expect(error.message).toBe('Network error');
    }));
  });
});
