import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TransaccionesService } from './transacciones.service';
import { StorageService } from './storage.service';
import { TareasService } from './tareas.service';
import { PuntosService } from './puntos.service';
import { TercerosService } from './terceros.service';
import { GlobalesService } from './globales.service';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Tarea } from '../interfaces/tarea.interface';
import { Punto } from '../interfaces/punto.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { CRUDOperacion, EntradaSalida, Estado } from './constants.service';

describe('TransaccionesService', () => {
  let service: TransaccionesService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let tareasServiceSpy: jasmine.SpyObj<TareasService>;
  let puntosServiceSpy: jasmine.SpyObj<PuntosService>;
  let tercerosServiceSpy: jasmine.SpyObj<TercerosService>;
  let globalesServiceSpy: jasmine.SpyObj<GlobalesService>;

  const mockTransaccion: Transaccion = {
    IdActividad: '1',
    IdTransaccion: '1',
    EntradaSalida: EntradaSalida.Entrada,
    IdEstado: Estado.Pendiente,
    IdRecurso: '1',
    IdServicio: '1',
    Titulo: '',
    IdDeposito: '1',
    IdTercero: '1'
  };

  const mockTarea: Tarea = {
    IdActividad: '1',
    IdTransaccion: '1',
    IdTarea: '1',
    EntradaSalida: EntradaSalida.Entrada,
    IdEstado: Estado.Pendiente,
    IdMaterial: '1',
    IdRecurso: '1',
    IdServicio: '1',
    Fotos: []
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

  const mockTransaction: Transaction = {
    Actividades: [],
    Tareas: [mockTarea],
    Transacciones: [mockTransaccion]
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const tareasSpy = jasmine.createSpyObj('TareasService', ['list']);
    const puntosSpy = jasmine.createSpyObj('PuntosService', ['list']);
    const tercerosSpy = jasmine.createSpyObj('TercerosService', ['list']);
    const globalesSpy = jasmine.createSpyObj('GlobalesService', ['getAccionEntradaSalida']);

    TestBed.configureTestingModule({
      providers: [
        TransaccionesService,
        { provide: StorageService, useValue: storageSpy },
        { provide: TareasService, useValue: tareasSpy },
        { provide: PuntosService, useValue: puntosSpy },
        { provide: TercerosService, useValue: tercerosSpy },
        { provide: GlobalesService, useValue: globalesSpy }
      ]
    });

    service = TestBed.inject(TransaccionesService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    tareasServiceSpy = TestBed.inject(TareasService) as jasmine.SpyObj<TareasService>;
    puntosServiceSpy = TestBed.inject(PuntosService) as jasmine.SpyObj<PuntosService>;
    tercerosServiceSpy = TestBed.inject(TercerosService) as jasmine.SpyObj<TercerosService>;
    globalesServiceSpy = TestBed.inject(GlobalesService) as jasmine.SpyObj<GlobalesService>;

    storageServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    tareasServiceSpy.list.and.returnValue(Promise.resolve([mockTarea]));
    puntosServiceSpy.list.and.returnValue(Promise.resolve([mockPunto]));
    tercerosServiceSpy.list.and.returnValue(Promise.resolve([mockTercero]));
    globalesServiceSpy.getAccionEntradaSalida.and.returnValue('Test Action');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSummary()', () => {
    it('should return correct summary for tareas', fakeAsync(() => {
      const tareasWithDifferentStates: Tarea[] = [
        { ...mockTarea, IdEstado: Estado.Aprobado, Cantidad: 10, Peso: 20, Volumen: 30 },
        { ...mockTarea, IdEstado: Estado.Pendiente },
        { ...mockTarea, IdEstado: Estado.Rechazado }
      ];
      tareasServiceSpy.list.and.returnValue(Promise.resolve(tareasWithDifferentStates));

      let result: any;
      service.getSummary('1', '1').then(res => result = res);
      tick();

      expect(result).toEqual({
        aprobados: 1,
        pendientes: 1,
        rechazados: 1,
        cantidad: 10,
        peso: 20,
        volumen: 30
      });
    }));

    it('should return zeros when no tareas exist', fakeAsync(() => {
      tareasServiceSpy.list.and.returnValue(Promise.resolve([]));

      let result: any;
      service.getSummary('1', '1').then(res => result = res);
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

  describe('list()', () => {
    it('should return transacciones with punto and tercero info', fakeAsync(() => {
      let result: Transaccion[] = [];
      service.list('1').then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].Punto).toBe('Test Point');
      expect(result[0].Tercero).toBe('Test Tercero');
      expect(result[0].Icono).toBe('location-outline');
      expect(result[0].Accion).toBe('Test Action');
    }));

    it('should return transacciones with tercero info when no punto exists', fakeAsync(() => {
      const transaccionWithoutPunto: Transaccion = {
        ...mockTransaccion,
        IdDeposito: undefined
      };
      storageServiceSpy.get.and.returnValue(Promise.resolve({
        ...mockTransaction,
        Transacciones: [transaccionWithoutPunto]
      }));

      let result: Transaccion[] = [];
      service.list('1').then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].Tercero).toBe('Test Tercero');
      expect(result[0].Icono).toBe('person');
    }));
  });

  describe('get()', () => {
    it('should return undefined when no transaction exists', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Transaccion | undefined;
      service.get('1', '1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));

    it('should return transaccion when found', fakeAsync(() => {
      let result: Transaccion | undefined;
      service.get('1', '1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdActividad).toBe('1');
      expect(result?.IdTransaccion).toBe('1');
    }));

    it('should set titulo when empty', fakeAsync(() => {
      const transaccionWithoutTitulo: Transaccion = {
        ...mockTransaccion,
        Titulo: ''
      };
      storageServiceSpy.get.and.returnValue(Promise.resolve({
        ...mockTransaction,
        Transacciones: [transaccionWithoutTitulo]
      }));

      let result: Transaccion | undefined;
      service.get('1', '1').then(res => result = res);
      tick();

      expect(result?.Titulo).toBe('Test Tercero-');
    }));
  });

  describe('getByPunto()', () => {
    it('should return undefined when no transaction exists', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Transaccion | undefined;
      service.getByPunto('1', '1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));

    it('should return transaccion when found by punto', fakeAsync(() => {
      let result: Transaccion | undefined;
      service.getByPunto('1', '1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdDeposito).toBe('1');
    }));
  });

  describe('getByTercero()', () => {
    it('should return undefined when no transaction exists', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Transaccion | undefined;
      service.getByTercero('1', '1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));

    it('should return transaccion when found by tercero', fakeAsync(() => {
      let result: Transaccion | undefined;
      service.getByTercero('1', '1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdTercero).toBe('1');
    }));
  });

  describe('create()', () => {
    it('should create transaccion with CRUD flag', fakeAsync(() => {
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      service.create(mockTransaccion);
      tick();

      expect(mockTransaccion.CRUD).toBe(CRUDOperacion.Create);
      expect(mockTransaccion.FechaInicial).toBeDefined();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('Transaction', mockTransaction);
    }));
  });

  describe('update()', () => {
    it('should update transaccion and related tareas', fakeAsync(() => {
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      const updatedTransaccion: Transaccion = {
        ...mockTransaccion,
        IdEstado: Estado.Aprobado,
        ResponsableCargo: 'Test Cargo',
        ResponsableNombre: 'Test Name'
      };

      service.update(updatedTransaccion);
      tick();

      const updatedTransaction = storageServiceSpy.set.calls.mostRecent().args[1];
      const updatedTarea = updatedTransaction.Tareas[0];

      expect(updatedTarea.IdEstado).toBe(Estado.Rechazado);
      expect(updatedTarea.CRUD).toBe(CRUDOperacion.Update);
      expect(updatedTarea.FechaEjecucion).toBeDefined();
    }));
  });
});
