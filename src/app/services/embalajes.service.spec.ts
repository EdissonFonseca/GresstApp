import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EmbalajesService } from './embalajes.service';
import { StorageService } from './storage.service';
import { MasterDataService } from './masterdata.service';
import { Embalaje } from '../interfaces/embalaje.interface';
import { CRUDOperacion } from './constants.service';

describe('EmbalajesService', () => {
  let service: EmbalajesService;
  let storageService: jasmine.SpyObj<StorageService>;
  let masterDataService: jasmine.SpyObj<MasterDataService>;

  const mockEmbalajes: Embalaje[] = [
    {
      IdEmbalaje: '1',
      Nombre: 'Embalaje B',
      CRUD: null,
      CRUDDate: null
    },
    {
      IdEmbalaje: '2',
      Nombre: 'Embalaje A',
      CRUD: null,
      CRUDDate: null
    }
  ];

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const masterDataSpy = jasmine.createSpyObj('MasterDataService', ['postEmbalaje']);

    TestBed.configureTestingModule({
      providers: [
        EmbalajesService,
        { provide: StorageService, useValue: storageSpy },
        { provide: MasterDataService, useValue: masterDataSpy }
      ]
    });

    service = TestBed.inject(EmbalajesService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    masterDataService = TestBed.inject(MasterDataService) as jasmine.SpyObj<MasterDataService>;

    storageService.get.and.returnValue(Promise.resolve(mockEmbalajes));
    storageService.set.and.returnValue(Promise.resolve());
    masterDataService.postEmbalaje.and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    storageService.get.calls.reset();
    storageService.set.calls.reset();
    masterDataService.postEmbalaje.calls.reset();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should return embalaje by id', fakeAsync(() => {
      let result: Embalaje | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeTruthy();
      expect(result?.IdEmbalaje).toBe('1');
      expect(result?.Nombre).toBe('Embalaje B');
    }));

    it('should return undefined when embalaje not found', fakeAsync(() => {
      let result: Embalaje | undefined;
      service.get('999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));

    it('should return undefined when no embalajes exist', fakeAsync(() => {
      storageService.get.and.returnValue(Promise.resolve(null));

      let result: Embalaje | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));
  });

  describe('list', () => {
    it('should return sorted embalajes by name', fakeAsync(() => {
      let result: Embalaje[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result.length).toBe(2);
      expect(result[0].Nombre).toBe('Embalaje A');
      expect(result[1].Nombre).toBe('Embalaje B');
    }));

    it('should handle empty embalajes list', fakeAsync(() => {
      storageService.get.and.returnValue(Promise.resolve([]));

      let result: Embalaje[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
    }));
  });

  describe('create', () => {
    it('should create new embalaje successfully', fakeAsync(() => {
      const newEmbalaje: Embalaje = {
        IdEmbalaje: '3',
        Nombre: 'Nuevo Embalaje',
        CRUD: null,
        CRUDDate: null
      };

      let result = false;
      service.create(newEmbalaje).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(masterDataService.postEmbalaje).toHaveBeenCalled();
      expect(storageService.set).toHaveBeenCalled();

      const savedEmbalajes = storageService.set.calls.mostRecent().args[1] as Embalaje[];
      const savedEmbalaje = savedEmbalajes.find(e => e.IdEmbalaje === '3');
      expect(savedEmbalaje).toBeTruthy();
      expect(savedEmbalaje?.CRUD).toBeNull();
      expect(savedEmbalaje?.CRUDDate).toBeNull();
    }));

    it('should handle post failure and still save locally', fakeAsync(() => {
      masterDataService.postEmbalaje.and.returnValue(Promise.resolve(false));

      const newEmbalaje: Embalaje = {
        IdEmbalaje: '3',
        Nombre: 'Nuevo Embalaje',
        CRUD: null,
        CRUDDate: null
      };

      let result = false;
      service.create(newEmbalaje).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(masterDataService.postEmbalaje).toHaveBeenCalled();
      expect(storageService.set).toHaveBeenCalled();

      const savedEmbalajes = storageService.set.calls.mostRecent().args[1] as Embalaje[];
      const savedEmbalaje = savedEmbalajes.find(e => e.IdEmbalaje === '3');
      expect(savedEmbalaje).toBeTruthy();
      expect(savedEmbalaje?.CRUD).toBe(CRUDOperacion.Create);
      expect(savedEmbalaje?.CRUDDate).toBeTruthy();
    }));

    it('should handle post error and still save locally', fakeAsync(() => {
      masterDataService.postEmbalaje.and.returnValue(Promise.reject('Error'));

      const newEmbalaje: Embalaje = {
        IdEmbalaje: '3',
        Nombre: 'Nuevo Embalaje',
        CRUD: null,
        CRUDDate: null
      };

      let result = false;
      service.create(newEmbalaje).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(masterDataService.postEmbalaje).toHaveBeenCalled();
      expect(storageService.set).toHaveBeenCalled();

      const savedEmbalajes = storageService.set.calls.mostRecent().args[1] as Embalaje[];
      const savedEmbalaje = savedEmbalajes.find(e => e.IdEmbalaje === '3');
      expect(savedEmbalaje).toBeTruthy();
      expect(savedEmbalaje?.CRUD).toBe(CRUDOperacion.Create);
      expect(savedEmbalaje?.CRUDDate).toBeTruthy();
    }));
  });
});
