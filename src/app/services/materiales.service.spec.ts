import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MaterialesService } from './materiales.service';
import { StorageService } from './storage.service';
import { MasterDataService } from './masterdata.service';
import { Material } from '../interfaces/material.interface';
import { CRUDOperacion } from './constants.service';

describe('MaterialesService', () => {
  let service: MaterialesService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let masterdataServiceSpy: jasmine.SpyObj<MasterDataService>;

  const mockMateriales: Material[] = [
    {
      IdMaterial: '1',
      Nombre: 'Material 1',
      Aprovechable: true,
      TipoCaptura: 'manual',
      TipoMedicion: 'kg',
      Referencia: 'REF001',
      Factor: 1.5
    },
    {
      IdMaterial: '2',
      Nombre: 'Material 2',
      Aprovechable: false,
      TipoCaptura: 'automatic',
      TipoMedicion: 'lt',
      Referencia: 'REF002',
      Factor: 2.0
    }
  ];

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const masterdataSpy = jasmine.createSpyObj('MasterDataService', ['postMaterial']);

    TestBed.configureTestingModule({
      providers: [
        MaterialesService,
        { provide: StorageService, useValue: storageSpy },
        { provide: MasterDataService, useValue: masterdataSpy }
      ]
    });

    service = TestBed.inject(MaterialesService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    masterdataServiceSpy = TestBed.inject(MasterDataService) as jasmine.SpyObj<MasterDataService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should return undefined when no materiales exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Material | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Materiales');
    }));

    it('should return undefined when material not found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockMateriales));

      let result: Material | undefined;
      service.get('999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Materiales');
    }));

    it('should return material when found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockMateriales));

      let result: Material | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdMaterial).toBe('1');
      expect(result?.Nombre).toBe('Material 1');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Materiales');
    }));
  });

  describe('list()', () => {
    it('should return empty array when no materiales exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Material[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Materiales');
    }));

    it('should return all materiales', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockMateriales));

      let result: Material[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual(mockMateriales);
      expect(result.length).toBe(2);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Materiales');
    }));
  });

  describe('create()', () => {
    it('should create material successfully when post succeeds', fakeAsync(() => {
      const newMaterial: Material = {
        IdMaterial: '',
        Nombre: 'New Material',
        Aprovechable: true,
        TipoCaptura: 'manual',
        TipoMedicion: 'kg'
      };

      storageServiceSpy.get.and.returnValue(Promise.resolve([]));
      masterdataServiceSpy.postMaterial.and.returnValue(Promise.resolve(true));

      let result = false;
      service.create(newMaterial).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(newMaterial.CRUD).toBeUndefined();
      expect(newMaterial.CRUDDate).toBeUndefined();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Materiales', [newMaterial]);
    }));

    it('should create material with CRUD flag when post fails', fakeAsync(() => {
      const newMaterial: Material = {
        IdMaterial: '',
        Nombre: 'New Material',
        Aprovechable: true,
        TipoCaptura: 'manual',
        TipoMedicion: 'kg'
      };

      storageServiceSpy.get.and.returnValue(Promise.resolve([]));
      masterdataServiceSpy.postMaterial.and.returnValue(Promise.reject(new Error('Network error')));

      let result = false;
      service.create(newMaterial).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(newMaterial.CRUD).toBe(CRUDOperacion.Create);
      expect(newMaterial.CRUDDate).toBeDefined();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Materiales', [newMaterial]);
    }));

    it('should add material to existing list', fakeAsync(() => {
      const newMaterial: Material = {
        IdMaterial: '',
        Nombre: 'New Material',
        Aprovechable: true,
        TipoCaptura: 'manual',
        TipoMedicion: 'kg'
      };

      storageServiceSpy.get.and.returnValue(Promise.resolve(mockMateriales));
      masterdataServiceSpy.postMaterial.and.returnValue(Promise.resolve(true));

      let result = false;
      service.create(newMaterial).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Materiales', [...mockMateriales, newMaterial]);
    }));
  });
});
