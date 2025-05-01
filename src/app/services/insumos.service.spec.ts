import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InsumosService } from './insumos.service';
import { StorageService } from './storage.service';
import { MasterDataService } from './masterdata.service';
import { Insumo } from '../interfaces/insumo.interface';
import { CRUDOperacion } from './constants.service';

describe('InsumosService', () => {
  let service: InsumosService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let masterdataServiceSpy: jasmine.SpyObj<MasterDataService>;

  const mockInsumos: Insumo[] = [
    {
      IdInsumo: '1',
      IdEstado: '1',
      Nombre: 'Test Insumo 1',
      Cantidad: 10,
      Unidad: 'kg'
    },
    {
      IdInsumo: '2',
      IdEstado: '1',
      Nombre: 'Test Insumo 2',
      Cantidad: 20,
      Unidad: 'lt'
    }
  ];

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const masterdataSpy = jasmine.createSpyObj('MasterDataService', ['postInsumo']);

    TestBed.configureTestingModule({
      providers: [
        InsumosService,
        { provide: StorageService, useValue: storageSpy },
        { provide: MasterDataService, useValue: masterdataSpy }
      ]
    });

    service = TestBed.inject(InsumosService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    masterdataServiceSpy = TestBed.inject(MasterDataService) as jasmine.SpyObj<MasterDataService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list()', () => {
    it('should return an array of insumos', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockInsumos));

      let result: Insumo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual(mockInsumos);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Insumos');
    }));

    it('should return empty array when no insumos exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve([]));

      let result: Insumo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Insumos');
    }));
  });

  describe('create()', () => {
    const newInsumo: Insumo = {
      IdInsumo: '',
      IdEstado: '1',
      Nombre: 'New Insumo',
      Cantidad: 15,
      Unidad: 'kg'
    };

    it('should create insumo successfully when masterdata service succeeds', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockInsumos));
      masterdataServiceSpy.postInsumo.and.returnValue(Promise.resolve(true));

      let result = false;
      service.create(newInsumo).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(masterdataServiceSpy.postInsumo).toHaveBeenCalledWith(newInsumo);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Insumos');
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Insumos', [...mockInsumos, newInsumo]);
      expect(newInsumo.CRUD).toBeUndefined();
      expect(newInsumo.CRUDDate).toBeUndefined();
    }));

    it('should create insumo with CRUD flag when masterdata service fails', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockInsumos));
      masterdataServiceSpy.postInsumo.and.returnValue(Promise.reject('Error'));

      let result = false;
      service.create(newInsumo).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(masterdataServiceSpy.postInsumo).toHaveBeenCalledWith(newInsumo);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Insumos');
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Insumos', [...mockInsumos, newInsumo]);
      expect(newInsumo.CRUD).toBe(CRUDOperacion.Create);
      expect(newInsumo.CRUDDate).toBeInstanceOf(Date);
    }));

    it('should create insumo with CRUD flag when masterdata service returns false', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockInsumos));
      masterdataServiceSpy.postInsumo.and.returnValue(Promise.resolve(false));

      let result = false;
      service.create(newInsumo).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(masterdataServiceSpy.postInsumo).toHaveBeenCalledWith(newInsumo);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Insumos');
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Insumos', [...mockInsumos, newInsumo]);
      expect(newInsumo.CRUD).toBe(CRUDOperacion.Create);
      expect(newInsumo.CRUDDate).toBeInstanceOf(Date);
    }));
  });
});
