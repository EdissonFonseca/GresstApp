import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PuntosService } from './puntos.service';
import { StorageService } from './storage.service';
import { Punto } from '../interfaces/punto.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Tarea } from '../interfaces/tarea.interface';
import { Estado } from './constants.service';

describe('PuntosService', () => {
  let service: PuntosService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  const mockPuntos: Punto[] = [
    {
      IdDeposito: '1',
      Nombre: 'Punto 1',
      IdPersona: '1',
      Tipo: '1',
      IdMateriales: [],
      Acopio: true,
      Almacenamiento: true,
      Disposicion: true,
      Entrega: true,
      Generacion: true,
      Recepcion: true,
      Tratamiento: true
    },
    {
      IdDeposito: '2',
      Nombre: 'Punto 2',
      IdPersona: '2',
      Tipo: '1',
      IdMateriales: [],
      Acopio: true,
      Almacenamiento: true,
      Disposicion: true,
      Entrega: true,
      Generacion: true,
      Recepcion: true,
      Tratamiento: true
    }
  ];

  const mockTransaction: Transaction = {
    Actividades: [],
    Tareas: [
      {
        IdActividad: '1',
        IdTarea: '1',
        IdDeposito: '1',
        IdEstado: Estado.Pendiente,
        IdMaterial: '1',
        IdRecurso: '1',
        IdServicio: '1',
        EntradaSalida: 'Entrada',
        Fotos: []
      },
      {
        IdActividad: '1',
        IdTarea: '2',
        IdDeposito: '2',
        IdEstado: Estado.Finalizado,
        IdMaterial: '2',
        IdRecurso: '1',
        IdServicio: '1',
        EntradaSalida: 'Salida',
        Fotos: []
      }
    ],
    Transacciones: []
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        PuntosService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(PuntosService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should return undefined when no puntos exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Punto | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
    }));

    it('should return undefined when punto not found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockPuntos));

      let result: Punto | undefined;
      service.get('999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
    }));

    it('should return punto when found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockPuntos));

      let result: Punto | undefined;
      service.get('1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdDeposito).toBe('1');
      expect(result?.Nombre).toBe('Punto 1');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
    }));
  });

  describe('list()', () => {
    it('should return empty array when no puntos exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(undefined));

      let result: Punto[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
    }));

    it('should return all puntos', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockPuntos));

      let result: Punto[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual(mockPuntos);
      expect(result.length).toBe(2);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
    }));
  });

  describe('getPuntosFromTareas()', () => {
    it('should return empty array when no transaction exists', fakeAsync(() => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockPuntos),
        Promise.resolve(undefined)
      );

      let result: Punto[] = [];
      service.getPuntosFromTareas('1').then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));

    it('should return puntos from tareas', fakeAsync(() => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockPuntos),
        Promise.resolve(mockTransaction)
      );

      let result: Punto[] = [];
      service.getPuntosFromTareas('1').then(res => result = res);
      tick();

      expect(result.length).toBe(2);
      expect(result[0].IdDeposito).toBe('1');
      expect(result[1].IdDeposito).toBe('2');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));
  });

  describe('getPuntosFromTareasPendientes()', () => {
    it('should return empty array when no transaction exists', fakeAsync(() => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockPuntos),
        Promise.resolve(undefined)
      );

      let result: Punto[] = [];
      service.getPuntosFromTareasPendientes('1').then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));

    it('should return only puntos from pending tareas', fakeAsync(() => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockPuntos),
        Promise.resolve(mockTransaction)
      );

      let result: Punto[] = [];
      service.getPuntosFromTareasPendientes('1').then(res => result = res);
      tick();

      expect(result.length).toBe(1);
      expect(result[0].IdDeposito).toBe('1');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Puntos');
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Transaction');
    }));
  });
});
