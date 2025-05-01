import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActividadesService } from './actividades.service';
import { StorageService } from './storage.service';
import { GlobalesService } from './globales.service';
import { TareasService } from './tareas.service';
import { Actividad } from '../interfaces/actividad.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { CRUDOperacion, Estado } from './constants.service';

describe('ActividadesService', () => {
  let service: ActividadesService;
  let storageService: jasmine.SpyObj<StorageService>;
  let globalesService: jasmine.SpyObj<GlobalesService>;
  let tareasService: jasmine.SpyObj<TareasService>;

  const mockServicio = {
    IdServicio: '1',
    Nombre: 'Test Service',
    Icono: 'test-icon'
  };

  const mockActividad: Actividad = {
    IdActividad: '1',
    IdServicio: '1',
    IdRecurso: '1',
    IdEstado: Estado.Pendiente,
    Titulo: 'Test Activity',
    FechaOrden: null,
    NavegarPorTransaccion: false,
    CRUD: null
  };

  const mockTarea: Tarea = {
    IdActividad: '1',
    IdTarea: '1',
    IdServicio: '1',
    IdRecurso: '1',
    IdEstado: Estado.Pendiente,
    EntradaSalida: 'true',
    Fotos: [],
    IdMaterial: '1',
    CRUD: null
  };

  const mockTransaccion: Transaccion = {
    IdActividad: '1',
    IdTransaccion: '1',
    IdServicio: '1',
    IdRecurso: '1',
    IdEstado: Estado.Pendiente,
    EntradaSalida: 'true',
    Titulo: 'Test Transaction',
    CRUD: null
  };

  const mockTransaction: Transaction = {
    Actividades: [mockActividad],
    Tareas: [mockTarea],
    Transacciones: [mockTransaccion]
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const globalesSpy = jasmine.createSpyObj('GlobalesService', ['getCurrentPosition'], {
      servicios: [mockServicio]
    });
    const tareasSpy = jasmine.createSpyObj('TareasService', ['list']);

    TestBed.configureTestingModule({
      providers: [
        ActividadesService,
        { provide: StorageService, useValue: storageSpy },
        { provide: GlobalesService, useValue: globalesSpy },
        { provide: TareasService, useValue: tareasSpy }
      ]
    });

    service = TestBed.inject(ActividadesService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    globalesService = TestBed.inject(GlobalesService) as jasmine.SpyObj<GlobalesService>;
    tareasService = TestBed.inject(TareasService) as jasmine.SpyObj<TareasService>;

    storageService.get.and.returnValue(Promise.resolve(mockTransaction));
    storageService.set.and.returnValue(Promise.resolve());
    globalesService.getCurrentPosition.and.returnValue(Promise.resolve([0, 0]));
  });

  afterEach(() => {
    storageService.get.calls.reset();
    storageService.set.calls.reset();
    globalesService.getCurrentPosition.calls.reset();
    tareasService.list.calls.reset();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSummary', () => {
    it('should return correct summary of tasks', fakeAsync(() => {
      const mockTareas = [
        { ...mockTarea, IdEstado: Estado.Aprobado, Cantidad: 5, Peso: 10, Volumen: 2 },
        { ...mockTarea, IdEstado: Estado.Pendiente },
        { ...mockTarea, IdEstado: Estado.Rechazado }
      ];
      tareasService.list.and.returnValue(Promise.resolve(mockTareas));

      let result: any;
      service.getSummary('1').then(res => result = res);
      tick();

      expect(result).toEqual({
        aprobados: 1,
        pendientes: 1,
        rechazados: 1,
        cantidad: 5,
        peso: 10,
        volumen: 2
      });
    }));

    it('should handle empty task list', fakeAsync(() => {
      tareasService.list.and.returnValue(Promise.resolve([]));

      let result: any;
      service.getSummary('1').then(res => result = res);
      tick();

      expect(result).toEqual({
        aprobados: 0,
        pendientes: 0,
        rechazados: 0,
        cantidad: 0,
        peso: 0,
        volumen: 0
      });
    }));
  });

  describe('list', () => {
    it('should return activities with service info', fakeAsync(() => {
      let result: Actividad[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result[0].Icono).toBe('test-icon');
      expect(result[0].Accion).toBe('Test Service');
    }));

    it('should return empty array when no activities exist', fakeAsync(() => {
      storageService.get.and.returnValue(Promise.resolve({ Actividades: [] }));

      let result: Actividad[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
    }));
  });

  describe('get', () => {
    it('should return activity with service info', fakeAsync(() => {
      let result: Actividad | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result?.Icono).toBe('test-icon');
      expect(result?.Accion).toBe('Test Service');
    }));

    it('should throw error when activity not found', fakeAsync(() => {
      let error: any;
      service.get('999').catch(err => error = err);
      tick();

      expect(error).toBeTruthy();
    }));
  });

  describe('getByServicio', () => {
    it('should return activity by service and resource', fakeAsync(() => {
      let result: Actividad | undefined;
      service.getByServicio('1', '1').then(res => result = res);
      tick();

      expect(result).toBeTruthy();
      expect(result?.IdServicio).toBe('1');
      expect(result?.IdRecurso).toBe('1');
    }));

    it('should return undefined when activity not found', fakeAsync(() => {
      let result: Actividad | undefined;
      service.getByServicio('999', '999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));
  });

  describe('create', () => {
    it('should create new activity with correct data', fakeAsync(() => {
      const newActividad: Actividad = {
        ...mockActividad,
        IdActividad: '2'
      };

      service.create(newActividad);
      tick();

      expect(storageService.set).toHaveBeenCalled();
      const savedTransaction = (storageService.set as jasmine.Spy).calls.mostRecent().args[1] as Transaction;
      expect(savedTransaction.Actividades).toContain(jasmine.objectContaining({
        IdActividad: '2',
        CRUD: CRUDOperacion.Create
      }));
    }));
  });

  describe('update', () => {
    it('should update activity and related tasks/transactions', fakeAsync(() => {
      const updatedActividad: Actividad = {
        ...mockActividad,
        IdEstado: Estado.Aprobado,
        CantidadCombustibleFinal: 100,
        KilometrajeFinal: 1000,
        ResponsableCargo: 'Test',
        ResponsableFirma: 'Test',
        ResponsableIdentificacion: '123',
        ResponsableNombre: 'Test',
        ResponsableObservaciones: 'Test'
      };

      service.update(updatedActividad);
      tick();

      expect(storageService.set).toHaveBeenCalled();
      const savedTransaction = (storageService.set as jasmine.Spy).calls.mostRecent().args[1] as Transaction;
      const updatedActivity = savedTransaction.Actividades.find(a => a.IdActividad === '1');
      expect(updatedActivity?.CRUD).toBe(CRUDOperacion.Update);
      expect(updatedActivity?.IdEstado).toBe(Estado.Aprobado);
    }));
  });

  describe('updateInicio', () => {
    it('should update activity start data', fakeAsync(() => {
      const updatedActividad: Actividad = {
        ...mockActividad,
        IdEstado: Estado.Pendiente,
        KilometrajeInicial: 1000,
        CantidadCombustibleInicial: 100
      };

      service.updateInicio(updatedActividad);
      tick();

      expect(storageService.set).toHaveBeenCalled();
      const savedTransaction = (storageService.set as jasmine.Spy).calls.mostRecent().args[1] as Transaction;
      const updatedActivity = savedTransaction.Actividades.find(a => a.IdActividad === '1');
      expect(updatedActivity?.CRUD).toBe(CRUDOperacion.Read);
      expect(updatedActivity?.IdEstado).toBe(Estado.Pendiente);
      expect(updatedActivity?.KilometrajeInicial).toBe(1000);
      expect(updatedActivity?.CantidadCombustibleInicial).toBe(100);
    }));
  });
});
