import { TestBed } from '@angular/core/testing';
import { TransactionsApiService } from './transactionsApi.service';
import { HttpService } from './http.service';
import { LoggerService } from '../core/logger.service';
import { StorageService } from '../core/storage.service';
import { Tarea } from '../../interfaces/tarea.interface';
import { Transaccion } from '../../interfaces/transaccion.interface';
import { Actividad } from '../../interfaces/actividad.interface';
import { Transaction } from '../../interfaces/transaction.interface';

describe('TransactionsApiService', () => {
  let service: TransactionsApiService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  const mockTarea: Tarea = {
    IdActividad: '1',
    IdTarea: '1',
    IdEstado: '1',
    IdMaterial: '1',
    IdRecurso: '1',
    IdServicio: '1',
    EntradaSalida: 'E',
    Fotos: []
  };

  const mockTransaccion: Transaccion = {
    IdTransaccion: '1',
    IdActividad: '1',
    IdDeposito: '1',
    IdTercero: '1',
    IdEstado: '1',
    IdRecurso: '1',
    IdServicio: '1',
    EntradaSalida: 'E',
    Titulo: 'Test Transaction',
    FechaInicial: new Date().toISOString()
  };

  const mockActividad: Actividad = {
    IdActividad: '1',
    IdEstado: '1',
    IdRecurso: '1',
    IdServicio: '1',
    FechaOrden: null,
    NavegarPorTransaccion: false,
    Titulo: 'Test Activity'
  };

  const mockTransaction: Transaction = {
    Actividades: [mockActividad],
    Tareas: [mockTarea],
    Transacciones: [mockTransaccion]
  };

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['get', 'post']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error', 'debug', 'info']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);

    TestBed.configureTestingModule({
      providers: [
        TransactionsApiService,
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    });

    service = TestBed.inject(TransactionsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should get all transactions successfully', async () => {
      const mockResponse = { status: 200, data: mockTransaction };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.get();

      expect(result).toEqual(mockTransaction);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/apptransactions/get');
    });

    it('should handle error when getting transactions', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.get()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting transactions', error);
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const mockResponse = { status: 201, data: { IdTarea: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createTask(mockTarea);

      expect(result).toBeTrue();
      expect(mockTarea.IdTarea).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/createtarea', mockTarea);
      expect(loggerServiceSpy.info).toHaveBeenCalledWith('Task created successfully', { taskId: '1' });
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createTask(mockTarea);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/createtarea', mockTarea);
    });

    it('should handle error when creating task', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.createTask(mockTarea)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating task', { task: mockTarea, error });
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const mockResponse = { status: 200, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateTask(mockTarea);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/updatetarea', mockTarea);
      expect(loggerServiceSpy.info).toHaveBeenCalledWith('Task updated successfully', { taskId: '1' });
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateTask(mockTarea);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/updatetarea', mockTarea);
    });

    it('should handle error when updating task', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updateTask(mockTarea)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error updating task', { task: mockTarea, error });
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const mockResponse = { status: 201, data: { IdTransaccion: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createTransaction(mockTransaccion);

      expect(result).toBeTrue();
      expect(mockTransaccion.IdTransaccion).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/createtransaccion', mockTransaccion);
      expect(loggerServiceSpy.info).toHaveBeenCalledWith('Transaction created successfully', { transactionId: '1' });
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createTransaction(mockTransaccion);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/createtransaccion', mockTransaccion);
    });

    it('should handle error when creating transaction', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.createTransaction(mockTransaccion)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating transaction', { transaction: mockTransaccion, error });
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction successfully', async () => {
      const mockResponse = { status: 200, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateTransaction(mockTransaccion);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/updatetransaccion', mockTransaccion);
      expect(loggerServiceSpy.info).toHaveBeenCalledWith('Transaction updated successfully', { transactionId: '1' });
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateTransaction(mockTransaccion);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/updatetransaccion', mockTransaccion);
    });

    it('should handle error when updating transaction', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updateTransaction(mockTransaccion)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error updating transaction', { transaction: mockTransaccion, error });
    });
  });

  describe('emitCertificate', () => {
    it('should emit certificate successfully', async () => {
      const mockResponse = { status: 200, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.emitCertificate(mockTransaccion);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/emitcertificate', mockTransaccion);
      expect(loggerServiceSpy.info).toHaveBeenCalledWith('Certificate emitted successfully', { transactionId: '1' });
    });

    it('should return false when emission fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.emitCertificate(mockTransaccion);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/emitcertificate', mockTransaccion);
    });

    it('should handle error when emitting certificate', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.emitCertificate(mockTransaccion)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error emitting certificate', { transaction: mockTransaccion, error });
    });
  });

  describe('createActivity', () => {
    it('should create activity successfully', async () => {
      const mockResponse = { status: 201, data: { IdActividad: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createActivity(mockActividad);

      expect(result).toBeTrue();
      expect(mockActividad.IdActividad).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/createactividad', mockActividad);
      expect(loggerServiceSpy.info).toHaveBeenCalledWith('Activity created successfully', { activityId: '1' });
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createActivity(mockActividad);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/createactividad', mockActividad);
    });

    it('should handle error when creating activity', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.createActivity(mockActividad)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating activity', { activity: mockActividad, error });
    });
  });

  describe('updateActivity', () => {
    it('should update activity successfully', async () => {
      const mockResponse = { status: 200, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateActivity(mockActividad);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/updateactividad', mockActividad);
      expect(loggerServiceSpy.info).toHaveBeenCalledWith('Activity updated successfully', { activityId: '1' });
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateActivity(mockActividad);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/updateactividad', mockActividad);
    });

    it('should handle error when updating activity', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updateActivity(mockActividad)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error updating activity', { activity: mockActividad, error });
    });
  });

  describe('updateInitialActivity', () => {
    it('should update initial activity successfully', async () => {
      const mockResponse = { status: 201, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateInitialActivity(mockActividad);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/updateactividadInicio', mockActividad);
      expect(loggerServiceSpy.info).toHaveBeenCalledWith('Initial activity created successfully', { activityId: '1' });
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateInitialActivity(mockActividad);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/apptransactions/updateactividadInicio', mockActividad);
    });

    it('should handle error when updating initial activity', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updateInitialActivity(mockActividad)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating initial activity', { activity: mockActividad, error });
    });
  });
});