import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TareasService } from './tareas.service';
import { StorageService } from './storage.service';
import { InventarioService } from './inventario.service';
import { MaterialesService } from './materiales.service';
import { TratamientosService } from './tratamientos.service';
import { EmbalajesService } from './embalajes.service';
import { PuntosService } from './puntos.service';
import { TercerosService } from './terceros.service';
import { GlobalesService } from './globales.service';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Material } from '../interfaces/material.interface';
import { Tratamiento } from '../interfaces/tratamiento.interface';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Punto } from '../interfaces/punto.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { CRUDOperacion, EntradaSalida, Estado, TipoServicio } from './constants.service';

describe('TareasService', () => {
  let service: TareasService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let inventarioServiceSpy: jasmine.SpyObj<InventarioService>;
  let materialesServiceSpy: jasmine.SpyObj<MaterialesService>;
  let tratamientosServiceSpy: jasmine.SpyObj<TratamientosService>;
  let embalajesServiceSpy: jasmine.SpyObj<EmbalajesService>;
  let puntosServiceSpy: jasmine.SpyObj<PuntosService>;
  let tercerosServiceSpy: jasmine.SpyObj<TercerosService>;
  let globalesServiceSpy: jasmine.SpyObj<GlobalesService>;

  const mockMaterial: Material = {
    IdMaterial: '1',
    Nombre: 'Test Material',
    Aprovechable: true,
    TipoCaptura: 'test',
    TipoMedicion: 'test'
  };

  const mockTratamiento: Tratamiento = {
    IdTratamiento: '1',
    IdServicio: '1',
    Nombre: 'Test Treatment'
  };

  const mockEmbalaje: Embalaje = {
    IdEmbalaje: '1',
    Nombre: 'Test Package'
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
    Nombre: 'Test Third Party',
    Identificacion: '123',
    Telefono: '1234567890'
  };

  const mockActividad: Actividad = {
    IdActividad: '1',
    IdServicio: TipoServicio.Almacenamiento,
    IdRecurso: '1',
    IdEstado: Estado.Pendiente,
    Titulo: 'Test Activity',
    FechaOrden: null,
    NavegarPorTransaccion: false
  };

  const mockTarea: Tarea = {
    IdActividad: '1',
    IdTransaccion: '1',
    IdTarea: '1',
    IdMaterial: '1',
    IdServicio: TipoServicio.Almacenamiento,
    IdRecurso: '1',
    IdEstado: Estado.Pendiente,
    EntradaSalida: EntradaSalida.Entrada,
    Fotos: []
  };

  const mockTransaction: Transaction = {
    Actividades: [mockActividad],
    Tareas: [mockTarea],
    Transacciones: []
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const inventarioSpy = jasmine.createSpyObj('InventarioService', ['list']);
    const materialesSpy = jasmine.createSpyObj('MaterialesService', ['list']);
    const tratamientosSpy = jasmine.createSpyObj('TratamientosService', ['list']);
    const embalajesSpy = jasmine.createSpyObj('EmbalajesService', ['list']);
    const puntosSpy = jasmine.createSpyObj('PuntosService', ['list', 'get']);
    const tercerosSpy = jasmine.createSpyObj('TercerosService', ['list']);
    const globalesSpy = jasmine.createSpyObj('GlobalesService', ['newId']);

    TestBed.configureTestingModule({
      providers: [
        TareasService,
        { provide: StorageService, useValue: storageSpy },
        { provide: InventarioService, useValue: inventarioSpy },
        { provide: MaterialesService, useValue: materialesSpy },
        { provide: TratamientosService, useValue: tratamientosSpy },
        { provide: EmbalajesService, useValue: embalajesSpy },
        { provide: PuntosService, useValue: puntosSpy },
        { provide: TercerosService, useValue: tercerosSpy },
        { provide: GlobalesService, useValue: globalesSpy }
      ]
    });

    service = TestBed.inject(TareasService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    inventarioServiceSpy = TestBed.inject(InventarioService) as jasmine.SpyObj<InventarioService>;
    materialesServiceSpy = TestBed.inject(MaterialesService) as jasmine.SpyObj<MaterialesService>;
    tratamientosServiceSpy = TestBed.inject(TratamientosService) as jasmine.SpyObj<TratamientosService>;
    embalajesServiceSpy = TestBed.inject(EmbalajesService) as jasmine.SpyObj<EmbalajesService>;
    puntosServiceSpy = TestBed.inject(PuntosService) as jasmine.SpyObj<PuntosService>;
    tercerosServiceSpy = TestBed.inject(TercerosService) as jasmine.SpyObj<TercerosService>;
    globalesServiceSpy = TestBed.inject(GlobalesService) as jasmine.SpyObj<GlobalesService>;

    storageServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    materialesServiceSpy.list.and.returnValue(Promise.resolve([mockMaterial]));
    tratamientosServiceSpy.list.and.returnValue(Promise.resolve([mockTratamiento]));
    embalajesServiceSpy.list.and.returnValue(Promise.resolve([mockEmbalaje]));
    puntosServiceSpy.list.and.returnValue(Promise.resolve([mockPunto]));
    tercerosServiceSpy.list.and.returnValue(Promise.resolve([mockTercero]));
    globalesServiceSpy.newId.and.returnValue('new-id');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should return undefined when no tareas exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Tarea | undefined;
      service.get('1', '1', '1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));

    it('should return undefined when tarea not found', fakeAsync(() => {
      let result: Tarea | undefined;
      service.get('1', '1', '999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));

    it('should return tarea when found', fakeAsync(() => {
      let result: Tarea | undefined;
      service.get('1', '1', '1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdTarea).toBe('1');
      expect(result?.IdMaterial).toBe('1');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));
  });

  describe('list()', () => {
    it('should return empty array when no tareas exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve({ Actividades: [], Tareas: [], Transacciones: [] }));

      let result: Tarea[] = [];
      service.list('1').then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));

    it('should return all tareas for actividad', fakeAsync(() => {
      let result: Tarea[] = [];
      service.list('1').then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].IdTarea).toBe('1');
      expect(result[0].Material).toBe('Test Material');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));

    it('should filter by transaccion when provided', fakeAsync(() => {
      let result: Tarea[] = [];
      service.list('1', '1').then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].IdTransaccion).toBe('1');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));
  });

  describe('create()', () => {
    it('should create tarea and update transaction', fakeAsync(() => {
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      service.create(mockTarea);
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Transaction', jasmine.any(Object));
      const updatedTransaction = storageServiceSpy.set.calls.mostRecent().args[1];
      expect(updatedTransaction.Tareas.length).toBe(2);
      expect(updatedTransaction.Tareas[1].CRUD).toBe(CRUDOperacion.Create);
    }));
  });

  describe('update()', () => {
    it('should update tarea when found by material', fakeAsync(() => {
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      const updatedTarea: Tarea = {
        ...mockTarea,
        Cantidad: 10,
        Observaciones: 'Updated'
      };

      service.update('1', '1', updatedTarea);
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Transaction', jasmine.any(Object));
      const updatedTransaction = storageServiceSpy.set.calls.mostRecent().args[1];
      expect(updatedTransaction.Tareas[0].CRUD).toBe(CRUDOperacion.Update);
      expect(updatedTransaction.Tareas[0].Cantidad).toBe(10);
      expect(updatedTransaction.Tareas[0].Observaciones).toBe('Updated');
    }));

    it('should update tarea when found by item', fakeAsync(() => {
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      const updatedTarea: Tarea = {
        ...mockTarea,
        Item: 1,
        Cantidad: 10,
        Observaciones: 'Updated'
      };

      service.update('1', '1', updatedTarea);
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Transaction', jasmine.any(Object));
      const updatedTransaction = storageServiceSpy.set.calls.mostRecent().args[1];
      expect(updatedTransaction.Tareas[0].CRUD).toBe(CRUDOperacion.Update);
      expect(updatedTransaction.Tareas[0].Cantidad).toBe(10);
      expect(updatedTransaction.Tareas[0].Observaciones).toBe('Updated');
    }));

    it('should not update when tarea not found', fakeAsync(() => {
      storageServiceSpy.set.and.returnValue(Promise.resolve());

      const updatedTarea: Tarea = {
        ...mockTarea,
        IdMaterial: '999',
        Cantidad: 10,
        Observaciones: 'Updated'
      };

      service.update('1', '1', updatedTarea);
      tick();

      expect(storageServiceSpy.set).not.toHaveBeenCalled();
    }));
  });

  describe('listSugeridas()', () => {
    it('should return suggested tasks for actividad', fakeAsync(() => {
      let result: Tarea[] = [];
      service.listSugeridas('1').then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].IdTarea).toBe('1');
      expect(result[0].Material).toBe('Test Material');
      expect(result[0].Accion).toBe('Almacenar');
    }));

    it('should filter by transaccion when provided', fakeAsync(() => {
      let result: Tarea[] = [];
      service.listSugeridas('1', '1').then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].IdTransaccion).toBe('1');
    }));
  });
});
