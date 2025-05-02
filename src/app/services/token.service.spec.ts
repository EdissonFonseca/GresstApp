import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { Storage } from '@ionic/storage-angular';

describe('TokenService', () => {
  let service: TokenService;
  let storageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Crear un spy para el Storage
    storageSpy = jasmine.createSpyObj('Storage', ['get', 'set', 'remove']);

    TestBed.configureTestingModule({
      providers: [
        TokenService,
        { provide: Storage, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getToken', () => {
    it('should return null when no token is stored', async () => {
      storageSpy.get.and.returnValue(Promise.resolve(null));
      const result = await service.getToken();
      expect(result).toBeNull();
    });

    it('should return null when token is expired', async () => {
      // Crear un token expirado
      const expiredToken = createExpiredToken();
      storageSpy.get.and.returnValue(Promise.resolve(expiredToken));

      const result = await service.getToken();
      expect(result).toBeNull();
    });

    it('should return token when valid', async () => {
      // Crear un token válido
      const validToken = createValidToken();
      storageSpy.get.and.returnValue(Promise.resolve(validToken));

      const result = await service.getToken();
      expect(result).toBe(validToken);
    });

    it('should handle storage errors', async () => {
      storageSpy.get.and.returnValue(Promise.reject('Storage error'));
      const result = await service.getToken();
      expect(result).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should store token, refresh token and username', async () => {
      const token = 'test-token';
      const refreshToken = 'test-refresh-token';
      const username = 'test-user';

      storageSpy.set.and.returnValue(Promise.resolve());
      storageSpy.get.and.returnValue(Promise.resolve(token));

      await service.setToken(token, refreshToken, username);

      expect(storageSpy.set).toHaveBeenCalledTimes(3);
      expect(storageSpy.set).toHaveBeenCalledWith('AccessToken', token);
      expect(storageSpy.set).toHaveBeenCalledWith('RefreshToken', refreshToken);
      expect(storageSpy.set).toHaveBeenCalledWith('Username', username);
    });

    it('should throw error when storage fails', async () => {
      storageSpy.set.and.returnValue(Promise.reject('Storage error'));

      await expectAsync(service.setToken('token', 'refresh', 'user'))
        .toBeRejectedWith('Storage error');
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token when stored', async () => {
      const refreshToken = 'test-refresh-token';
      storageSpy.get.and.returnValue(Promise.resolve(refreshToken));

      const result = await service.getRefreshToken();
      expect(result).toBe(refreshToken);
    });

    it('should return null when no refresh token is stored', async () => {
      storageSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.getRefreshToken();
      expect(result).toBeNull();
    });

    it('should handle storage errors', async () => {
      storageSpy.get.and.returnValue(Promise.reject('Storage error'));

      const result = await service.getRefreshToken();
      expect(result).toBeNull();
    });
  });

  describe('getUsername', () => {
    it('should return username when stored', async () => {
      const username = 'test-user';
      storageSpy.get.and.returnValue(Promise.resolve(username));

      const result = await service.getUsername();
      expect(result).toBe(username);
    });

    it('should return null when no username is stored', async () => {
      storageSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.getUsername();
      expect(result).toBeNull();
    });

    it('should handle storage errors', async () => {
      storageSpy.get.and.returnValue(Promise.reject('Storage error'));

      const result = await service.getUsername();
      expect(result).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should remove all tokens', async () => {
      storageSpy.remove.and.returnValue(Promise.resolve());

      await service.clearTokens();

      expect(storageSpy.remove).toHaveBeenCalledTimes(3);
      expect(storageSpy.remove).toHaveBeenCalledWith('AccessToken');
      expect(storageSpy.remove).toHaveBeenCalledWith('RefreshToken');
      expect(storageSpy.remove).toHaveBeenCalledWith('Username');
    });

    it('should throw error when storage fails', async () => {
      storageSpy.remove.and.returnValue(Promise.reject('Storage error'));

      await expectAsync(service.clearTokens())
        .toBeRejectedWith('Storage error');
    });
  });

  describe('hasValidToken', () => {
    it('should return true when valid token exists', async () => {
      const validToken = createValidToken();
      storageSpy.get.and.returnValue(Promise.resolve(validToken));

      const result = await service.hasValidToken();
      expect(result).toBeTrue();
    });

    it('should return false when no token exists', async () => {
      storageSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.hasValidToken();
      expect(result).toBeFalse();
    });
  });

  describe('hasRefreshToken', () => {
    it('should return true when refresh token exists', async () => {
      storageSpy.get.and.returnValue(Promise.resolve('refresh-token'));

      const result = await service.hasRefreshToken();
      expect(result).toBeTrue();
    });

    it('should return false when no refresh token exists', async () => {
      storageSpy.get.and.returnValue(Promise.resolve(null));

      const result = await service.hasRefreshToken();
      expect(result).toBeFalse();
    });
  });
});

// Funciones auxiliares para crear tokens de prueba
function createExpiredToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hora en el pasado
    iat: Math.floor(Date.now() / 1000) - 7200
  }));
  const signature = 'test-signature';
  return `${header}.${payload}.${signature}`;
}

function createValidToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora en el futuro
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = 'test-signature';
  return `${header}.${payload}.${signature}`;
}
