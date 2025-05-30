import { TestBed } from '@angular/core/testing';
import { AuthorizationApiService, UserPermissions } from './authorizationApi.service';
import { HttpService } from './http.service';
import { Storage } from '@ionic/storage-angular';
import { LoggerService } from '../core/logger.service';
import { STORAGE } from '@app/constants/constants';
import { jwtDecode } from 'jwt-decode';

describe('AuthorizationApiService', () => {
  let service: AuthorizationApiService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let storageSpy: jasmine.SpyObj<Storage>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockUserPermissions: UserPermissions = {
    roles: [
      {
        id: 1,
        name: 'admin',
        description: 'Administrator',
        permissions: [
          { id: 1, name: 'read', description: 'Read permission' },
          { id: 2, name: 'write', description: 'Write permission' }
        ]
      }
    ],
    permissions: [
      { id: 1, name: 'read', description: 'Read permission' },
      { id: 2, name: 'write', description: 'Write permission' }
    ]
  };

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['get']);
    storageSpy = jasmine.createSpyObj('Storage', ['get']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        AuthorizationApiService,
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: Storage, useValue: storageSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    });

    service = TestBed.inject(AuthorizationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should retrieve user permissions successfully', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.get();

      expect(result).toEqual(mockUserPermissions);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/authorization/get/app');
    });

    it('should handle error when getting permissions', async () => {
      const error = new Error('Failed to get permissions');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.get()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting user permissions', error);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid token', async () => {
      const mockToken = 'valid.token.here';
      const mockDecodedToken = { exp: Date.now() / 1000 + 3600 }; // Token expires in 1 hour
      storageSpy.get.and.returnValue(Promise.resolve(mockToken));
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockDecodedToken);

      const result = await service.isTokenValid();

      expect(result).toBeTrue();
      expect(storageSpy.get).toHaveBeenCalledWith(STORAGE.ACCESS_TOKEN);
    });

    it('should return false when token is missing', async () => {
      storageSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.isTokenValid();

      expect(result).toBeFalse();
    });

    it('should return false for expired token', async () => {
      const mockToken = 'expired.token.here';
      const mockDecodedToken = { exp: Date.now() / 1000 - 3600 }; // Token expired 1 hour ago
      storageSpy.get.and.returnValue(Promise.resolve(mockToken));
      spyOn<any>(jwtDecode, 'default').and.returnValue(mockDecodedToken);

      const result = await service.isTokenValid();

      expect(result).toBeFalse();
    });

    it('should handle token validation error', async () => {
      storageSpy.get.and.returnValue(Promise.resolve('invalid.token'));
      spyOn<any>(jwtDecode, 'default').and.throwError('Invalid token');

      const result = await service.isTokenValid();

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has the permission', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasPermission('read');

      expect(result).toBeTrue();
    });

    it('should return false when user does not have the permission', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasPermission('delete');

      expect(result).toBeFalse();
    });

    it('should handle error when checking permission', async () => {
      const error = new Error('Failed to check permission');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      const result = await service.hasPermission('read');

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasRole('admin');

      expect(result).toBeTrue();
    });

    it('should return false when user does not have the role', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasRole('user');

      expect(result).toBeFalse();
    });

    it('should handle error when checking role', async () => {
      const error = new Error('Failed to check role');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      const result = await service.hasRole('admin');

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has any of the permissions', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasAnyPermission(['read', 'delete']);

      expect(result).toBeTrue();
    });

    it('should return false when user has none of the permissions', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasAnyPermission(['delete', 'update']);

      expect(result).toBeFalse();
    });

    it('should handle error when checking permissions', async () => {
      const error = new Error('Failed to check permissions');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      const result = await service.hasAnyPermission(['read', 'write']);

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasAllPermissions(['read', 'write']);

      expect(result).toBeTrue();
    });

    it('should return false when user is missing any permission', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasAllPermissions(['read', 'delete']);

      expect(result).toBeFalse();
    });

    it('should handle error when checking permissions', async () => {
      const error = new Error('Failed to check permissions');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      const result = await service.hasAllPermissions(['read', 'write']);

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has any of the roles', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasAnyRole(['admin', 'user']);

      expect(result).toBeTrue();
    });

    it('should return false when user has none of the roles', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasAnyRole(['user', 'guest']);

      expect(result).toBeFalse();
    });

    it('should handle error when checking roles', async () => {
      const error = new Error('Failed to check roles');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      const result = await service.hasAnyRole(['admin', 'user']);

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });

  describe('hasAllRoles', () => {
    it('should return true when user has all roles', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasAllRoles(['admin']);

      expect(result).toBeTrue();
    });

    it('should return false when user is missing any role', async () => {
      httpServiceSpy.get.and.returnValue(Promise.resolve({ status: 200, data: mockUserPermissions }));

      const result = await service.hasAllRoles(['admin', 'user']);

      expect(result).toBeFalse();
    });

    it('should handle error when checking roles', async () => {
      const error = new Error('Failed to check roles');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      const result = await service.hasAllRoles(['admin']);

      expect(result).toBeFalse();
      expect(loggerServiceSpy.error).toHaveBeenCalled();
    });
  });
});
