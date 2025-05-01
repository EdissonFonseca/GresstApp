import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TercerosService } from './terceros.service';
import { StorageService } from './storage.service';
import { MasterDataService } from './masterdata.service';
import { Tercero } from '../interfaces/tercero.interface';
import { Punto } from '../interfaces/punto.interface';
import { CRUDOperacion } from './constants.service';

describe('TercerosService', () => {
  let service: TercerosService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let masterdataServiceSpy: jasmine.SpyObj<MasterDataService>;

  const mockTercero: Tercero = {
    IdPersona: '1',
    Nombre: 'Test Tercero',
    Identificacion: '123456789',
    Telefono: '1234567890',
    Correo: 'test@example.com',
    Cliente: true,
    Proveedor: false,
    Empleado: false,
    Transportador: false
  };

  const mockPunto: Punto = {
    IdDeposito: '1',
    Nombre: 'Test Point',
    IdMateriales: ['1'],
    IdPersona: '1',
    Tipo: 'test',
    Acopio: true,
    Almacenamiento: true,
    Disposicion: true,
    Entrega: true,
    Generacion: true,
    Recepcion: true,
    Tratamiento: true
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const masterdataSpy = jasmine.createSpyObj('MasterDataService', ['postTercero']);

    TestBed.configureTestingModule({
      providers: [
        TercerosService,
        { provide: StorageService, useValue: storageSpy },
        { provide: MasterDataService, useValue: masterdataSpy }
      ]
    });

    service = TestBed.inject(TercerosService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    masterdataServiceSpy = TestBed.inject(MasterDataService) as jasmine.SpyObj<MasterDataService>;

    storageServiceSpy.get.and.returnValue(Promise.resolve([mockTercero]));
    masterdataServiceSpy.postTercero.and.returnValue(Promise.resolve(true));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should return undefined when no terceros exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Tercero | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Terceros');
    }));

    it('should return undefined when tercero not found', fakeAsync(() => {
      let result: Tercero | undefined;
      service.get('999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Terceros');
    }));

    it('should return tercero when found', fakeAsync(() => {
      let result: Tercero | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdPersona).toBe('1');
      expect(result?.Nombre).toBe('Test Tercero');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Terceros');
    }));
  });

  describe('list()', () => {
    it('should return empty array when no terceros exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Tercero[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Terceros');
    }));

    it('should return all terceros', fakeAsync(() => {
      let result: Tercero[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].IdPersona).toBe('1');
      expect(result[0].Nombre).toBe('Test Tercero');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Terceros');
    }));
  });

  describe('getTercerosConPuntos()', () => {
    it('should return empty array when no terceros exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Tercero[] = [];
      service.getTercerosConPuntos().then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Terceros');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
    }));

    it('should return only terceros with puntos', fakeAsync(() => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve([mockTercero]),
        Promise.resolve([mockPunto])
      );

      let result: Tercero[] = [];
      service.getTercerosConPuntos().then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].IdPersona).toBe('1');
      expect(result[0].Nombre).toBe('Test Tercero');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Terceros');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
    }));

    it('should filter out terceros without puntos', fakeAsync(() => {
      const terceroWithoutPunto: Tercero = {
        ...mockTercero,
        IdPersona: '2'
      };

      storageServiceSpy.get.and.returnValues(
        Promise.resolve([mockTercero, terceroWithoutPunto]),
        Promise.resolve([mockPunto])
      );

      let result: Tercero[] = [];
      service.getTercerosConPuntos().then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].IdPersona).toBe('1');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Terceros');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
    }));
  });

  describe('create()', () => {
    it('should create tercero successfully with masterdata post', fakeAsync(() => {
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      let result = false;
      service.create(mockTercero).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(mockTercero.CRUD).toBeUndefined();
      expect(mockTercero.CRUDDate).toBeUndefined();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Terceros', jasmine.any(Array));
      expect(masterdataServiceSpy.postTercero).toHaveBeenCalledWith(mockTercero);
    }));

    it('should create tercero with CRUD flag when masterdata post fails', fakeAsync(() => {
      storageServiceSpy.set.and.returnValue(Promise.resolve());
      masterdataServiceSpy.postTercero.and.returnValue(Promise.reject(new Error('Network error')));

      let result = false;
      service.create(mockTercero).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(mockTercero.CRUD).toBe(CRUDOperacion.Create);
      expect(mockTercero.CRUDDate).toBeDefined();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Terceros', jasmine.any(Array));
      expect(masterdataServiceSpy.postTercero).toHaveBeenCalledWith(mockTercero);
    }));

    it('should add tercero to existing list', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve([mockTercero]));
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      const newTercero: Tercero = {
        ...mockTercero,
        IdPersona: '2',
        Nombre: 'New Tercero'
      };

      let result = false;
      service.create(newTercero).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Terceros', jasmine.any(Array));
      const updatedTerceros = storageServiceSpy.set.calls.mostRecent().args[1];
      expect(updatedTerceros.length).toBe(2);
      expect(updatedTerceros[1].IdPersona).toBe('2');
      expect(updatedTerceros[1].Nombre).toBe('New Tercero');
    }));
  });
});
