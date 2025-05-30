import { TestBed } from '@angular/core/testing';
import { InventoryApiService, Inventario } from './inventoryApi.service';
import { HttpService } from './http.service';
import { LoggerService } from '../core/logger.service';
import { Residuo } from '../../interfaces/residuo.interface';
import { Mensaje } from '../../interfaces/mensaje.interface';
import { Interlocutor } from '../../interfaces/interlocutor.interface';

describe('InventoryApiService', () => {
  let service: InventoryApiService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockResiduo: Residuo = {
    IdResiduo: '1',
    IdMaterial: '1',
    IdEstado: '1',
    IdPropietario: '1',
    IdDepositoOrigen: '1',
    Material: 'Test Material',
    Propietario: 'Test Owner',
    DepositoOrigen: 'Test Origin',
    Ubicacion: 'Test Location',
    Cantidades: '10 units',
    Cantidad: 10,
    Peso: 100,
    Volumen: 50,
    Aprovechable: true
  };

  const mockInventario: Inventario = {
    IdInventario: '1',
    IdResiduo: '1',
    IdEstado: '1',
    IdRecurso: '1',
    IdServicio: '1',
    Titulo: 'Test Inventory'
  };

  const mockMensaje: Mensaje = {
    EnvioRecepcion: 'E',
    Mensaje: 'Test Message',
    Enviado: false,
    Leido: false,
    Fecha: new Date().toISOString()
  };

  const mockInterlocutor: Interlocutor = {
    IdInterlocutor: '1',
    Nombre: 'Test Interlocutor',
    Correo: 'test@example.com',
    Fecha: '2024-03-20',
    Mensaje: 'Test message'
  };

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['get', 'post']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        InventoryApiService,
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    });

    service = TestBed.inject(InventoryApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBank', () => {
    it('should get bank information successfully', async () => {
      const mockResponse = { status: 200, data: { bankInfo: 'test' } };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getBank();

      expect(result).toEqual(mockResponse.data);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/appinventory/banco');
    });

    it('should handle error when getting bank information', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getBank()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting bank information', error);
    });
  });

  describe('get', () => {
    it('should get all inventory items successfully', async () => {
      const mockResponse = { status: 200, data: [mockResiduo] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.get();

      expect(result).toEqual([mockResiduo]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/appinventory/get');
    });

    it('should handle error when getting inventory items', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.get()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting inventory items', error);
    });
  });

  describe('getMessages', () => {
    it('should get messages successfully', async () => {
      const mockResponse = { status: 200, data: [mockMensaje] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getMessages('1', '1');

      expect(result).toEqual([mockMensaje]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/appinventory/mensajes/1/1');
    });

    it('should handle error when getting messages', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getMessages('1', '1')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting messages', { idResiduo: '1', idInterlocutor: '1', error });
    });
  });

  describe('getCounterparts', () => {
    it('should get counterparts successfully', async () => {
      const mockResponse = { status: 200, data: [mockInterlocutor] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getCounterparts('1');

      expect(result).toEqual([mockInterlocutor]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/appinventory/interlocutores/1');
    });

    it('should handle error when getting counterparts', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getCounterparts('1')).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting counterparts', { idResiduo: '1', error });
    });
  });

  describe('create', () => {
    it('should create inventory item successfully', async () => {
      const mockResponse = { status: 201, data: { IdInventario: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.create(mockInventario);

      expect(result).toBeTrue();
      expect(mockInventario.IdInventario).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/appinventory/post', mockInventario);
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.create(mockInventario);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/appinventory/post', mockInventario);
    });

    it('should handle error when creating inventory item', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.create(mockInventario)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating inventory item', { inventario: mockInventario, error });
    });
  });

  describe('update', () => {
    it('should update inventory item successfully', async () => {
      const mockResponse = { status: 200, data: { success: true } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.update(mockInventario);

      expect(result).toBeTrue();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/appinventory/patch', mockInventario);
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: { success: false } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.update(mockInventario);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/appinventory/patch', mockInventario);
    });

    it('should handle error when updating inventory item', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.update(mockInventario)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error updating inventory item', { inventario: mockInventario, error });
    });
  });
});