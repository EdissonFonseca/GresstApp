import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VehiculosService } from './vehiculos.service';
import { StorageService } from './storage.service';
import { Vehiculo } from '../interfaces/vehiculo.interface';

describe('VehiculosService', () => {
  let service: VehiculosService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  const mockVehiculo: Vehiculo = {
    IdVehiculo: '1',
    Nombre: 'Test Vehicle',
    IdMateriales: ['1', '2']
  };

  const mockVehiculos: Vehiculo[] = [
    mockVehiculo,
    {
      IdVehiculo: '2',
      Nombre: 'Test Vehicle 2',
      IdMateriales: ['3', '4']
    }
  ];

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        VehiculosService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(VehiculosService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list()', () => {
    it('should return empty array when no vehiculos exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Vehiculo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
    }));

    it('should return all vehiculos when they exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockVehiculos));

      let result: Vehiculo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual(mockVehiculos);
      expect(result.length).toBe(2);
    }));
  });
});
