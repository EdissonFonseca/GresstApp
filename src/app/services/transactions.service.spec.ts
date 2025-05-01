import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TransactionsService } from './transactions.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Transaction } from '../interfaces/transaction.interface';
import { StorageService } from './storage.service';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let httpMock: HttpTestingController;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TransactionsService,
        {
          provide: StorageService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({})),
            set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
            clear: jasmine.createSpy('clear').and.returnValue(Promise.resolve())
          }
        }
      ]
    });
    service = TestBed.inject(TransactionsService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET methods', () => {
    it('should get transactions successfully', fakeAsync(() => {
      const mockResponse = { data: 'test-data' };
      let result: any;

      service.get().then(res => result = res);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/get`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
      tick();

      expect(result).toEqual(mockResponse);
    }));

    it('should handle get errors', fakeAsync(() => {
      let error: any;

      service.get().catch(err => error = err);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/get`);
      expect(req.request.method).toBe('GET');
      req.error(new ErrorEvent('Network error'));
      tick();

      expect(error.message).toContain('Request error');
    }));
  });

  describe('POST methods', () => {
    it('should post tarea successfully', fakeAsync(() => {
      const tarea: Tarea = {
        IdTarea: '',
        IdActividad: '1',
        IdEstado: '1',
        IdMaterial: '1',
        IdRecurso: '1',
        IdServicio: '1',
        EntradaSalida: 'true',
        Fotos: []
      };
      let result = false;

      service.postTarea(tarea).then(res => result = res);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/posttarea`);
      expect(req.request.method).toBe('POST');
      req.flush({ IdTarea: '123' });
      tick();

      expect(result).toBeTrue();
      expect(tarea.IdTarea).toBe('123');
    }));

    it('should post transaccion successfully', fakeAsync(() => {
      const transaccion: Transaccion = {
        IdTransaccion: '',
        IdActividad: '1',
        IdEstado: '1',
        IdRecurso: '1',
        IdServicio: '1',
        EntradaSalida: 'true',
        Titulo: 'Test Transaction'
      };
      let result = false;

      service.postTransaccion(transaccion).then(res => result = res);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/posttransaccion`);
      expect(req.request.method).toBe('POST');
      req.flush({ IdTransaccion: '123' });
      tick();

      expect(result).toBeTrue();
      expect(transaccion.IdTransaccion).toBe('123');
    }));

    it('should post actividad successfully', fakeAsync(() => {
      const actividad: Actividad = {
        IdActividad: '',
        IdEstado: '1',
        IdRecurso: '1',
        IdServicio: '1',
        Titulo: 'Test Activity',
        NavegarPorTransaccion: false,
        FechaOrden: null
      };
      let result = false;

      service.postActividad(actividad).then(res => result = res);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/postactividad`);
      expect(req.request.method).toBe('POST');
      req.flush({ IdActividad: '123' });
      tick();

      expect(result).toBeTrue();
      expect(actividad.IdActividad).toBe('123');
    }));

    it('should post actividad inicio successfully', fakeAsync(() => {
      const actividad: Actividad = {
        IdActividad: '',
        IdEstado: '1',
        IdRecurso: '1',
        IdServicio: '1',
        Titulo: 'Test Activity',
        NavegarPorTransaccion: false,
        FechaOrden: null
      };
      let result = false;

      service.postActividadInicio(actividad).then(res => result = res);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/postactividadinicio`);
      expect(req.request.method).toBe('POST');
      req.flush({ IdActividad: '123' });
      tick();

      expect(result).toBeTrue();
      expect(actividad.IdActividad).toBe('123');
    }));

    it('should post backup successfully', fakeAsync(() => {
      const mockData = { test: 'data' };
      let result = false;

      service.postBackup(mockData).then(res => result = res);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/backup`);
      expect(req.request.method).toBe('POST');
      req.flush({});
      tick();

      expect(result).toBeTrue();
    }));

    it('should handle post errors', fakeAsync(() => {
      const tarea: Tarea = {
        IdTarea: '',
        IdActividad: '1',
        IdEstado: '1',
        IdMaterial: '1',
        IdRecurso: '1',
        IdServicio: '1',
        EntradaSalida: 'true',
        Fotos: []
      };
      let error: any;

      service.postTarea(tarea).catch(err => error = err);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/posttarea`);
      expect(req.request.method).toBe('POST');
      req.error(new ErrorEvent('Network error'));
      tick();

      expect(error.message).toContain('Request error');
    }));
  });

  describe('PATCH methods', () => {
    it('should patch transaccion successfully', fakeAsync(() => {
      const transaccion: Transaccion = {
        IdTransaccion: '123',
        IdActividad: '1',
        IdEstado: '1',
        IdRecurso: '1',
        IdServicio: '1',
        EntradaSalida: 'true',
        Titulo: 'Test Transaction'
      };
      let result = false;

      service.patchTransaccion(transaccion).then(res => result = res);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/patchtransaccion`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
      tick();

      expect(result).toBeTrue();
    }));

    it('should handle patch errors', fakeAsync(() => {
      const transaccion: Transaccion = {
        IdTransaccion: '123',
        IdActividad: '1',
        IdEstado: '1',
        IdRecurso: '1',
        IdServicio: '1',
        EntradaSalida: 'true',
        Titulo: 'Test Transaction'
      };
      let error: any;

      service.patchTransaccion(transaccion).catch(err => error = err);
      const req = httpMock.expectOne(`${environment.apiUrl}/transactions/patchtransaccion`);
      expect(req.request.method).toBe('PATCH');
      req.error(new ErrorEvent('Network error'));
      tick();

      expect(error.message).toContain('Request error');
    }));
  });
});
