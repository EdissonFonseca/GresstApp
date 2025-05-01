import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiciosService } from './servicios.service';
import { StorageService } from './storage.service';
import { GlobalesService } from './globales.service';
import { Servicio } from '../interfaces/servicio.interface';
import { TipoServicio } from './constants.service';

describe('ServiciosService', () => {
  let service: ServiciosService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let globalesServiceSpy: jasmine.SpyObj<GlobalesService>;

  const mockServicios: Servicio[] = [
    {
      IdServicio: '1',
      Nombre: 'Servicio 1',
      CRUDDate: new Date()
    },
    {
      IdServicio: '2',
      Nombre: 'Servicio 2',
      CRUDDate: new Date()
    }
  ];

  const mockGlobalesServicios = [
    {
      IdServicio: TipoServicio.Acopio,
      Nombre: 'Acopio',
      Accion: 'Almacenamiento temporal',
      Icono: '../../assets/icon/warehouse.svg'
    },
    {
      IdServicio: TipoServicio.Almacenamiento,
      Nombre: 'Almacenamiento',
      Accion: 'Almacenamiento definitivo',
      Icono: '../../assets/icon/archive.svg'
    }
  ];

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const globalesSpy = jasmine.createSpyObj('GlobalesService', [], {
      servicios: mockGlobalesServicios
    });

    TestBed.configureTestingModule({
      providers: [
        ServiciosService,
        { provide: StorageService, useValue: storageSpy },
        { provide: GlobalesService, useValue: globalesSpy }
      ]
    });

    service = TestBed.inject(ServiciosService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    globalesServiceSpy = TestBed.inject(GlobalesService) as jasmine.SpyObj<GlobalesService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should return undefined when no servicios exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Servicio | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Servicios');
    }));

    it('should return undefined when servicio not found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockServicios));

      let result: Servicio | undefined;
      service.get('999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Servicios');
    }));

    it('should return servicio when found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockServicios));

      let result: Servicio | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdServicio).toBe('1');
      expect(result?.Nombre).toBe('Servicio 1');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Servicios');
    }));
  });

  describe('list()', () => {
    it('should return empty array when no servicios exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Servicio[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Servicios');
    }));

    it('should return all servicios', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockServicios));

      let result: Servicio[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual(mockServicios);
      expect(result.length).toBe(2);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Servicios');
    }));
  });

  describe('create()', () => {
    it('should not create servicio when not found in globales', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockServicios));
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      service.create('999');
      tick();

      expect(storageServiceSpy.set).not.toHaveBeenCalled();
    }));

    it('should create servicio when found in globales', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockServicios));
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      service.create(TipoServicio.Acopio);
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Servicios', jasmine.any(Array));
      const updatedServicios = storageServiceSpy.set.calls.mostRecent().args[1];
      expect(updatedServicios.length).toBe(3);
      expect(updatedServicios[2].IdServicio).toBe(TipoServicio.Acopio);
      expect(updatedServicios[2].Nombre).toBe('Acopio');
      expect(updatedServicios[2].CRUDDate).toBeDefined();
    }));
  });

  describe('delete()', () => {
    it('should delete servicio when found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockServicios));
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      service.delete('1');
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Servicios', jasmine.any(Array));
      const updatedServicios = storageServiceSpy.set.calls.mostRecent().args[1];
      expect(updatedServicios.length).toBe(1);
      expect(updatedServicios[0].IdServicio).toBe('2');
    }));

    it('should not modify servicios when id not found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockServicios));
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      service.delete('999');
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Servicios', mockServicios);
    }));
  });
});
