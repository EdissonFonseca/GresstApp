import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TratamientosService } from './tratamientos.service';
import { StorageService } from './storage.service';
import { Tratamiento } from '../interfaces/tratamiento.interface';

describe('TratamientosService', () => {
  let service: TratamientosService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  const mockTratamiento: Tratamiento = {
    IdTratamiento: '1',
    Nombre: 'Test Treatment',
    IdServicio: '1',
    Descripcion: 'Test Description'
  };

  const mockTratamientos: Tratamiento[] = [
    mockTratamiento,
    {
      IdTratamiento: '2',
      Nombre: 'Test Treatment 2',
      IdServicio: '1',
      Descripcion: 'Test Description 2'
    }
  ];

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        TratamientosService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(TratamientosService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should return undefined when no tratamientos exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Tratamiento | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));

    it('should return undefined when tratamiento is not found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockTratamientos));

      let result: Tratamiento | undefined;
      service.get('999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));

    it('should return tratamiento when found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockTratamientos));

      let result: Tratamiento | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdTratamiento).toBe('1');
      expect(result?.Nombre).toBe('Test Treatment');
    }));
  });

  describe('list()', () => {
    it('should return empty array when no tratamientos exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Tratamiento[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
    }));

    it('should return all tratamientos when they exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockTratamientos));

      let result: Tratamiento[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual(mockTratamientos);
      expect(result.length).toBe(2);
    }));
  });
});
