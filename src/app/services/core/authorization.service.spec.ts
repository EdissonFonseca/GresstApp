import { TestBed } from '@angular/core/testing';
import { AuthorizationService } from './authorization.services';
import { Platform } from '@ionic/angular';
import { StorageService } from './storage.service';
import { STORAGE, PERMISSIONS, CRUD_OPERATIONS } from '@app/constants/constants';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let platformSpy: jasmine.SpyObj<Platform>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  const mockAccount = {
    IdPersonaCuenta: '123',
    permisos: {
      [PERMISSIONS.APP_COLLECTION]: CRUD_OPERATIONS.CREATE,
      [PERMISSIONS.APP_TRANSPORT]: CRUD_OPERATIONS.CREATE,
      [PERMISSIONS.APP_CERTIFICATE]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_ACCOUNT]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_PACKAGE]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_SUPPLY]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_MATERIAL]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_SERVICE]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_POINT]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_THIRD_PARTY]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_TREATMENT]: CRUD_OPERATIONS.READ,
      [PERMISSIONS.APP_VEHICLE]: CRUD_OPERATIONS.READ
    },
    servicios: ['SERVICE1', 'SERVICE2']
  };

  beforeEach(() => {
    platformSpy = jasmine.createSpyObj('Platform', ['is']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        AuthorizationService,
        { provide: Platform, useValue: platformSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    });

    service = TestBed.inject(AuthorizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPermission', () => {
    it('should return permission string when account has the permission', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockAccount));

      const result = await service.getPermission(PERMISSIONS.APP_COLLECTION);

      expect(result).toBe(CRUD_OPERATIONS.CREATE);
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });

    it('should return empty string when account does not have the permission', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockAccount));

      const result = await service.getPermission('NON_EXISTENT_PERMISSION');

      expect(result).toBe('');
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });

    it('should return empty string when account is not found', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.getPermission(PERMISSIONS.APP_COLLECTION);

      expect(result).toBe('');
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });
  });

  describe('getPersonId', () => {
    it('should return person ID when account exists', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockAccount));

      const result = await service.getPersonId();

      expect(result).toBe('123');
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });

    it('should return undefined when account is not found', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.getPersonId();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });
  });

  describe('getAccount', () => {
    it('should return account object', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockAccount));

      const result = await service.getAccount();

      expect(result).toEqual(mockAccount);
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });
  });

  describe('allowService', () => {
    it('should return true when service is allowed', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockAccount));

      const result = await service.allowService('SERVICE1');

      expect(result).toBeTrue();
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });

    it('should return false when service is not allowed', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockAccount));

      const result = await service.allowService('SERVICE3');

      expect(result).toBeFalse();
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });

    it('should return false when account is not found', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.allowService('SERVICE1');

      expect(result).toBeFalse();
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });
  });

  describe('allowAddActivity', () => {
    it('should return true when user has collection permission', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockAccount));

      const result = await service.allowAddActivity();

      expect(result).toBeTrue();
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });

    it('should return true when user has transport permission', async () => {
      const accountWithoutCollection = {
        ...mockAccount,
        permisos: {
          ...mockAccount.permisos,
          [PERMISSIONS.APP_COLLECTION]: ''
        }
      };
      storageServiceSpy.get.and.returnValue(Promise.resolve(accountWithoutCollection));

      const result = await service.allowAddActivity();

      expect(result).toBeTrue();
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });

    it('should return false when user has neither permission', async () => {
      const accountWithoutPermissions = {
        ...mockAccount,
        permisos: {
          ...mockAccount.permisos,
          [PERMISSIONS.APP_COLLECTION]: '',
          [PERMISSIONS.APP_TRANSPORT]: ''
        }
      };
      storageServiceSpy.get.and.returnValue(Promise.resolve(accountWithoutPermissions));

      const result = await service.allowAddActivity();

      expect(result).toBeFalse();
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });

    it('should return false when account is not found', async () => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.allowAddActivity();

      expect(result).toBeFalse();
      expect(storageServiceSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    });
  });
});