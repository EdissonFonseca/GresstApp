import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Storage } from '@ionic/storage-angular';

describe('StorageService', () => {
  let service: StorageService;
  let storageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Storage', ['create', 'set', 'get', 'remove', 'clear']);
    spy.create.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useValue: spy }
      ]
    });

    service = TestBed.inject(StorageService);
    storageSpy = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
  });

  afterEach(() => {
    // Limpiar todos los mocks después de cada prueba
    storageSpy.create.calls.reset();
    storageSpy.set.calls.reset();
    storageSpy.get.calls.reset();
    storageSpy.remove.calls.reset();
    storageSpy.clear.calls.reset();
  });

  afterAll(() => {
    // Limpiar el TestBed después de todas las pruebas
    TestBed.resetTestingModule();
  });

  it('should be created', fakeAsync(() => {
    expect(service).toBeTruthy();
    tick();
    expect(storageSpy.create).toHaveBeenCalled();
  }));

  describe('set', () => {
    it('should store a value with the given key', fakeAsync(() => {
      const key = 'testKey';
      const value = 'testValue';
      storageSpy.set.and.returnValue(Promise.resolve());

      service.set(key, value);
      tick();

      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
    }));

    it('should store complex objects', fakeAsync(() => {
      const key = 'testObject';
      const value = { name: 'test', id: 1, nested: { data: 'value' } };
      storageSpy.set.and.returnValue(Promise.resolve());

      service.set(key, value);
      tick();

      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
    }));

    it('should handle null values', fakeAsync(() => {
      const key = 'testNull';
      const value = null;
      storageSpy.set.and.returnValue(Promise.resolve());

      service.set(key, value);
      tick();

      expect(storageSpy.set).toHaveBeenCalledWith(key, value);
    }));
  });

  describe('get', () => {
    it('should retrieve a stored value', fakeAsync(() => {
      const key = 'testKey';
      const value = 'testValue';
      storageSpy.get.and.returnValue(Promise.resolve(value));

      let result: any;
      service.get(key).then(res => result = res);
      tick();

      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    }));

    it('should return null for non-existent keys', fakeAsync(() => {
      const key = 'nonExistentKey';
      storageSpy.get.and.returnValue(Promise.resolve(null));

      let result: any;
      service.get(key).then(res => result = res);
      tick();

      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    }));

    it('should retrieve complex objects', fakeAsync(() => {
      const key = 'testObject';
      const value = { name: 'test', id: 1, nested: { data: 'value' } };
      storageSpy.get.and.returnValue(Promise.resolve(value));

      let result: any;
      service.get(key).then(res => result = res);
      tick();

      expect(storageSpy.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    }));
  });

  describe('remove', () => {
    it('should remove a stored value', fakeAsync(() => {
      const key = 'testKey';
      storageSpy.remove.and.returnValue(Promise.resolve());

      service.remove(key);
      tick();

      expect(storageSpy.remove).toHaveBeenCalledWith(key);
    }));

    it('should handle removing non-existent keys', fakeAsync(() => {
      const key = 'nonExistentKey';
      storageSpy.remove.and.returnValue(Promise.resolve());

      service.remove(key);
      tick();

      expect(storageSpy.remove).toHaveBeenCalledWith(key);
    }));
  });

  describe('clear', () => {
    it('should clear all stored values', fakeAsync(() => {
      storageSpy.clear.and.returnValue(Promise.resolve());

      service.clear();
      tick();

      expect(storageSpy.clear).toHaveBeenCalled();
    }));

    it('should handle errors during clear operation', fakeAsync(() => {
      storageSpy.clear.and.returnValue(Promise.reject(new Error('Clear failed')));

      let error: any;
      service.clear().catch(err => error = err);
      tick();

      expect(error).toBeTruthy();
    }));
  });

  describe('error handling', () => {
    it('should handle errors during set operation', fakeAsync(() => {
      const key = 'testKey';
      const value = 'testValue';
      storageSpy.set.and.returnValue(Promise.reject(new Error('Set failed')));

      let error: any;
      service.set(key, value).catch(err => error = err);
      tick();

      expect(error).toBeTruthy();
    }));

    it('should handle errors during get operation', fakeAsync(() => {
      const key = 'testKey';
      storageSpy.get.and.returnValue(Promise.reject(new Error('Get failed')));

      let error: any;
      service.get(key).catch(err => error = err);
      tick();

      expect(error).toBeTruthy();
    }));

    it('should handle errors during remove operation', fakeAsync(() => {
      const key = 'testKey';
      storageSpy.remove.and.returnValue(Promise.reject(new Error('Remove failed')));

      let error: any;
      service.remove(key).catch(err => error = err);
      tick();

      expect(error).toBeTruthy();
    }));
  });
});
