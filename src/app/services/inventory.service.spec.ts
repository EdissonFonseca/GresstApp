import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InventoryService } from './inventory.service';
import { CapacitorHttp } from '@capacitor/core';
import { environment } from '../../environments/environment';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InventoryService]
    });

    service = TestBed.inject(InventoryService);
  });

  afterEach(() => {
    // Limpiar todos los mocks después de cada prueba
    (CapacitorHttp.get as jasmine.Spy).calls.reset();
  });

  afterAll(() => {
    // Limpiar el TestBed después de todas las pruebas
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBanco', () => {
    const mockResponse = { data: 'test-data' };

    it('should return data when request is successful', fakeAsync(() => {
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 200,
        data: mockResponse,
        headers: {},
        url: ''
      }));

      let result: any;
      service.getBanco().then(res => result = res);
      tick();

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.get).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/appbanco/get`,
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should throw error when request fails', fakeAsync(() => {
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 401,
        data: {},
        headers: {},
        url: ''
      }));

      let error: any;
      service.getBanco().catch(err => error = err);
      tick();

      expect(error.message).toBe('Request error');
    }));

    it('should throw error when network request fails', fakeAsync(() => {
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.reject(new Error('Network error')));

      let error: any;
      service.getBanco().catch(err => error = err);
      tick();

      expect(error.message).toBe('Network error');
    }));
  });

  describe('get', () => {
    const mockResponse = { data: 'test-data' };

    it('should return data when request is successful', fakeAsync(() => {
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 200,
        data: mockResponse,
        headers: {},
        url: ''
      }));

      let result: any;
      service.get().then(res => result = res);
      tick();

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.get).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/appinventory/get`,
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should throw error when request fails', fakeAsync(() => {
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 401,
        data: {},
        headers: {},
        url: ''
      }));

      let error: any;
      service.get().catch(err => error = err);
      tick();

      expect(error.message).toBe('Request error');
    }));

    it('should throw error when network request fails', fakeAsync(() => {
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.reject(new Error('Network error')));

      let error: any;
      service.get().catch(err => error = err);
      tick();

      expect(error.message).toBe('Network error');
    }));
  });
});
