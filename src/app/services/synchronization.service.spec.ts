import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SynchronizationService } from './synchronization.service';
import { StorageService } from './storage.service';
import { AuthenticationService } from './authentication.service';
import { GlobalesService } from './globales.service';
import { AuthorizationService } from './authorization.service';
import { InventoryService } from './inventory.service';
import { MasterDataService } from './masterdata.service';
import { TransactionsService } from './transactions.service';
import { environment } from '../../environments/environment';
import { Transaction } from '../interfaces/transaction.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Tarea } from '../interfaces/tarea.interface';
import { CRUDOperacion } from './constants.service';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Filesystem, Directory, WriteFileResult } from '@capacitor/filesystem';

describe('SynchronizationService', () => {
  let service: SynchronizationService;
  let httpMock: HttpTestingController;
  let storageService: StorageService;
  let authService: AuthenticationService;
  let globalesService: GlobalesService;
  let authorizationService: AuthorizationService;
  let inventoryService: InventoryService;
  let masterdataService: MasterDataService;
  let transactionsService: TransactionsService;
  let ionicStorage: Storage;

  const mockTransaction: Transaction = {
    Actividades: [],
    Transacciones: [],
    Tareas: []
  };

  const mockActividad: Actividad = {
    IdActividad: '1',
    FechaOrden: null,
    IdEstado: '1',
    IdRecurso: '1',
    IdServicio: '1',
    Titulo: 'Test Activity',
    NavegarPorTransaccion: false,
    CRUD: null
  };

  const mockTransaccion: Transaccion = {
    IdActividad: '1',
    IdTransaccion: '1',
    EntradaSalida: 'true',
    IdEstado: '1',
    IdRecurso: '1',
    IdServicio: '1',
    Titulo: 'Test Transaction',
    CRUD: null
  };

  const mockTarea: Tarea = {
    IdActividad: '1',
    IdTarea: '1',
    EntradaSalida: 'true',
    Fotos: [],
    IdEstado: '1',
    IdMaterial: '1',
    IdRecurso: '1',
    IdServicio: '1',
    CRUD: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SynchronizationService,
        StorageService,
        AuthenticationService,
        GlobalesService,
        AuthorizationService,
        InventoryService,
        MasterDataService,
        TransactionsService,
        {
          provide: Storage,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({})),
            set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
            clear: jasmine.createSpy('clear').and.returnValue(Promise.resolve())
          }
        }
      ]
    });

    service = TestBed.inject(SynchronizationService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService);
    authService = TestBed.inject(AuthenticationService);
    globalesService = TestBed.inject(GlobalesService);
    authorizationService = TestBed.inject(AuthorizationService);
    inventoryService = TestBed.inject(InventoryService);
    masterdataService = TestBed.inject(MasterDataService);
    transactionsService = TestBed.inject(TransactionsService);
    ionicStorage = TestBed.inject(Storage);

    // Setup spies
    spyOn(storageService, 'get').and.returnValue(Promise.resolve(mockTransaction));
    spyOn(storageService, 'set').and.returnValue(Promise.resolve());
    spyOn(storageService, 'clear').and.returnValue(Promise.resolve());
    spyOn(authService, 'ping').and.returnValue(Promise.resolve(true));
    spyOn(globalesService, 'getCurrentPosition').and.returnValue(Promise.resolve([0, 0]));

    // Mock Filesystem
    spyOn(Filesystem, 'writeFile').and.returnValue(Promise.resolve({
      uri: 'file://test.json'
    } as WriteFileResult));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('countPendingTransactions', () => {
    it('should count pending transactions correctly', async () => {
      const mockTransactionWithPending: Transaction = {
        Actividades: [
          { ...mockActividad, CRUD: CRUDOperacion.Create },
          { ...mockActividad, CRUD: null }
        ],
        Transacciones: [
          { ...mockTransaccion, CRUD: CRUDOperacion.Update }
        ],
        Tareas: [
          { ...mockTarea, CRUD: CRUDOperacion.Create },
          { ...mockTarea, CRUD: null }
        ]
      };

      spyOn(storageService, 'get').and.returnValue(Promise.resolve(mockTransactionWithPending));
      await service.countPendingTransactions();
      expect(service.pendingTransactions()).toBe(3);
    });

    it('should set count to 0 when no transaction exists', async () => {
      spyOn(storageService, 'get').and.returnValue(Promise.resolve(null));
      await service.countPendingTransactions();
      expect(service.pendingTransactions()).toBe(0);
    });

    it('should handle errors and set count to 0', async () => {
      spyOn(storageService, 'get').and.returnValue(Promise.reject(new Error('Storage error')));
      await service.countPendingTransactions();
      expect(service.pendingTransactions()).toBe(0);
    });
  });

  describe('download operations', () => {
    it('should download authorizations successfully', async () => {
      const mockData = { id: 1 };
      spyOn(authorizationService, 'get').and.returnValue(Promise.resolve(mockData));
      await service.downloadAuthorizations();
      expect(storageService.set).toHaveBeenCalledWith('Cuenta', mockData);
    });

    it('should handle authorization download errors', async () => {
      spyOn(authorizationService, 'get').and.returnValue(Promise.reject(new Error('Download failed')));
      await expectAsync(service.downloadAuthorizations()).toBeRejected();
    });

    it('should download inventory successfully', async () => {
      const mockInventory = [{ id: 1 }];
      spyOn(inventoryService, 'get').and.returnValue(Promise.resolve(mockInventory));
      await service.downloadInventory();
      expect(storageService.set).toHaveBeenCalledWith('Inventario', mockInventory);
    });

    it('should handle inventory download errors', async () => {
      spyOn(inventoryService, 'get').and.returnValue(Promise.reject(new Error('Download failed')));
      await expectAsync(service.downloadInventory()).toBeRejected();
    });

    it('should download master data successfully', async () => {
      const mockData = { id: 1 };
      spyOn(masterdataService, 'getEmbalajes').and.returnValue(Promise.resolve([mockData]));
      spyOn(masterdataService, 'getMateriales').and.returnValue(Promise.resolve([mockData]));
      spyOn(masterdataService, 'getPuntos').and.returnValue(Promise.resolve([mockData]));
      spyOn(masterdataService, 'getServicios').and.returnValue(Promise.resolve([mockData]));
      spyOn(masterdataService, 'getTerceros').and.returnValue(Promise.resolve([mockData]));
      spyOn(masterdataService, 'getTratamientos').and.returnValue(Promise.resolve([mockData]));
      spyOn(masterdataService, 'getVehiculos').and.returnValue(Promise.resolve([mockData]));

      await service.downloadMasterData();

      expect(storageService.set).toHaveBeenCalledWith('Embalajes', [mockData]);
      expect(storageService.set).toHaveBeenCalledWith('Materiales', [mockData]);
      expect(storageService.set).toHaveBeenCalledWith('Puntos', [mockData]);
      expect(storageService.set).toHaveBeenCalledWith('Servicios', [mockData]);
      expect(storageService.set).toHaveBeenCalledWith('Terceros', [mockData]);
      expect(storageService.set).toHaveBeenCalledWith('Tratamientos', [mockData]);
      expect(storageService.set).toHaveBeenCalledWith('Vehiculos', [mockData]);
    });

    it('should handle master data download errors', async () => {
      spyOn(masterdataService, 'getEmbalajes').and.returnValue(Promise.reject(new Error('Download failed')));
      await expectAsync(service.downloadMasterData()).toBeRejected();
    });
  });

  describe('upload operations', () => {
    it('should upload master data successfully', async () => {
      const mockData = { id: 1, CRUD: CRUDOperacion.Create };
      spyOn(storageService, 'get').and.returnValue(Promise.resolve([mockData]));
      spyOn(masterdataService, 'postEmbalaje').and.returnValue(Promise.resolve(true));
      spyOn(masterdataService, 'postMaterial').and.returnValue(Promise.resolve(true));
      spyOn(masterdataService, 'postTercero').and.returnValue(Promise.resolve(true));

      const result = await service.uploadMasterData();
      expect(result).toBeTrue();
    });

    it('should handle master data upload errors', async () => {
      const mockData = { id: 1, CRUD: CRUDOperacion.Create };
      spyOn(storageService, 'get').and.returnValue(Promise.resolve([mockData]));
      spyOn(masterdataService, 'postEmbalaje').and.returnValue(Promise.reject(new Error('Upload failed')));

      await expectAsync(service.uploadMasterData()).toBeRejected();
    });

    it('should upload transactions successfully', async () => {
      const mockTransactionWithCRUD: Transaction = {
        Actividades: [
          { ...mockActividad, CRUD: CRUDOperacion.Create, LongitudInicial: 0 }
        ],
        Transacciones: [
          { ...mockTransaccion, CRUD: CRUDOperacion.Create, Latitud: 0 }
        ],
        Tareas: []
      };

      spyOn(storageService, 'get').and.returnValue(Promise.resolve(mockTransactionWithCRUD));
      spyOn(transactionsService, 'postActividad').and.returnValue(Promise.resolve(true));
      spyOn(transactionsService, 'postTransaccion').and.returnValue(Promise.resolve(true));

      const result = await service.uploadTransactions();
      expect(result).toBeTrue();
    });

    it('should handle transaction upload errors', async () => {
      const mockTransactionWithCRUD: Transaction = {
        Actividades: [
          { ...mockActividad, CRUD: CRUDOperacion.Create }
        ],
        Transacciones: [],
        Tareas: []
      };

      spyOn(storageService, 'get').and.returnValue(Promise.resolve(mockTransactionWithCRUD));
      spyOn(transactionsService, 'postActividad').and.returnValue(Promise.resolve(false));

      const result = await service.uploadTransactions();
      expect(result).toBeFalse();
    });
  });

  describe('load and refresh', () => {
    it('should load data successfully when online', async () => {
      const result = await service.load();
      expect(result).toBeTrue();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/sync/initial`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should return false when offline during load', async () => {
      spyOn(authService, 'ping').and.returnValue(Promise.resolve(false));
      const result = await service.load();
      expect(result).toBeFalse();
    });

    it('should refresh data successfully when online', async () => {
      const result = await service.refresh();
      expect(result).toBeTrue();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/sync/refresh`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should return false when offline during refresh', async () => {
      spyOn(authService, 'ping').and.returnValue(Promise.resolve(false));
      const result = await service.refresh();
      expect(result).toBeFalse();
    });
  });

  describe('close and forceQuit', () => {
    it('should close successfully when online and transactions upload', async () => {
      spyOn(service, 'uploadTransactions').and.returnValue(Promise.resolve(true));
      const result = await service.close();
      expect(result).toBeTrue();
      expect(storageService.clear).toHaveBeenCalled();
    });

    it('should return false when offline during close', async () => {
      spyOn(authService, 'ping').and.returnValue(Promise.resolve(false));
      const result = await service.close();
      expect(result).toBeFalse();
      expect(storageService.clear).not.toHaveBeenCalled();
    });

    it('should force quit successfully when backup succeeds', async () => {
      const mockData = {
        transactions: [],
        masterData: [],
        inventory: [],
        authorizations: []
      };
      spyOn(storageService, 'get').and.returnValue(Promise.resolve(mockData));
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 200,
        data: {},
        headers: {},
        url: ''
      } as HttpResponse));

      await expectAsync(service.forceQuit()).toBeResolvedTo(undefined);

      expect(Filesystem.writeFile).toHaveBeenCalled();
      expect(CapacitorHttp.post).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/api/transactions/backup`,
        data: jasmine.any(Object),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      expect(storageService.clear).toHaveBeenCalled();
    });

    it('should handle backup failure during force quit', async () => {
      const mockData = {
        transactions: [],
        masterData: [],
        inventory: [],
        authorizations: []
      };
      spyOn(storageService, 'get').and.returnValue(Promise.resolve(mockData));
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.reject(new Error('Backup failed')));

      await expectAsync(service.forceQuit()).toBeResolvedTo(undefined);

      expect(Filesystem.writeFile).toHaveBeenCalled();
      expect(storageService.clear).toHaveBeenCalled();
    });
  });
});
