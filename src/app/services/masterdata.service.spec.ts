import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MasterDataService } from './masterdata.service';
import { CapacitorHttp } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Material } from '../interfaces/material.interface';
import { Insumo } from '../interfaces/insumo.interface';
import { Tercero } from '../interfaces/tercero.interface';

describe('MasterDataService', () => {
  let service: MasterDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MasterDataService]
    });
    service = TestBed.inject(MasterDataService);
  });

  afterEach(() => {
    // Limpiar todos los mocks después de cada prueba
    (CapacitorHttp.get as jasmine.Spy).calls.reset();
    (CapacitorHttp.post as jasmine.Spy).calls.reset();
  });

  afterAll(() => {
    // Limpiar el TestBed después de todas las pruebas
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET methods', () => {
    const mockResponse = { data: 'test-data' };

    const testGetMethod = (methodName: string, url: string) => {
      it(`should return data when ${methodName} request is successful`, fakeAsync(() => {
        spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
          status: 200,
          data: mockResponse,
          headers: {},
          url: ''
        }));

        let result: any;
        (service as any)[methodName]().then((res: any) => result = res);
        tick();

        expect(result).toEqual(mockResponse);
        expect(CapacitorHttp.get).toHaveBeenCalledWith({
          url: `${environment.apiUrl}${url}`,
          headers: { 'Content-Type': 'application/json' }
        });
      }));

      it(`should throw error when ${methodName} request fails`, fakeAsync(() => {
        spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
          status: 401,
          data: {},
          headers: {},
          url: ''
        }));

        let error: any;
        (service as any)[methodName]().catch((err: any) => error = err);
        tick();

        expect(error.message).toBe('Request error');
      }));

      it(`should throw error when ${methodName} network request fails`, fakeAsync(() => {
        spyOn(CapacitorHttp, 'get').and.returnValue(Promise.reject(new Error('Network error')));

        let error: any;
        (service as any)[methodName]().catch((err: any) => error = err);
        tick();

        expect(error.message).toBe('Network error');
      }));
    };

    testGetMethod('getEmbalajes', '/embalajes/get');
    testGetMethod('getInsumos', '/insumos/get');
    testGetMethod('getMateriales', '/materiales/getforapp');
    testGetMethod('getPuntos', '/depositos/getpuntos');
    testGetMethod('getServicios', '/servicios/get');
    testGetMethod('getTerceros', '/terceros/get');
    testGetMethod('getTratamientos', '/tratamientos/get');
    testGetMethod('getVehiculos', '/vehiculos/getautorizados');

    it('should get interlocutores successfully', fakeAsync(() => {
      const idResiduo = '123';
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 200,
        data: mockResponse,
        headers: {},
        url: ''
      }));

      let result: any;
      service.getInterlocutores(idResiduo).then(res => result = res);
      tick();

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.get).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/mensajes/listinterlocutores/${idResiduo}`,
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should get mensajes successfully', fakeAsync(() => {
      const idResiduo = '123';
      const idInterlocutor = '456';
      spyOn(CapacitorHttp, 'get').and.returnValue(Promise.resolve({
        status: 200,
        data: mockResponse,
        headers: {},
        url: ''
      }));

      let result: any;
      service.getMensajes(idResiduo, idInterlocutor).then(res => result = res);
      tick();

      expect(result).toEqual(mockResponse);
      expect(CapacitorHttp.get).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/mensajes/get`,
        headers: { 'Content-Type': 'application/json' }
      });
    }));
  });

  describe('POST methods', () => {
    const mockCreatedResponse = { IdEmbalaje: '123' };

    it('should post embalaje successfully', fakeAsync(() => {
      const embalaje: Embalaje = {
        IdEmbalaje: '',
        Nombre: 'Test Embalaje'
      };
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 201,
        data: mockCreatedResponse,
        headers: {},
        url: ''
      }));

      let result = false;
      service.postEmbalaje(embalaje).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(embalaje.IdEmbalaje).toBe('123');
      expect(CapacitorHttp.post).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/embalajes/post`,
        data: { Nombre: embalaje.Nombre },
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should post insumo successfully', fakeAsync(() => {
      const insumo: Insumo = {
        IdInsumo: '',
        IdEstado: '1',
        Nombre: 'Test Insumo'
      };
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 201,
        data: { IdInsumo: '123' },
        headers: {},
        url: ''
      }));

      let result = false;
      service.postInsumo(insumo).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(insumo.IdInsumo).toBe('123');
      expect(CapacitorHttp.post).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/insumos/post`,
        data: { Nombre: insumo.Nombre },
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should post material successfully', fakeAsync(() => {
      const material: Material = {
        IdMaterial: '',
        Aprovechable: true,
        Nombre: 'Test Material',
        TipoMedicion: 'kg',
        TipoCaptura: 'manual',
        Referencia: 'ref1',
        Factor: 1
      };
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 201,
        data: { IdMaterial: '123' },
        headers: {},
        url: ''
      }));

      let result = false;
      service.postMaterial(material).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(material.IdMaterial).toBe('123');
      expect(CapacitorHttp.post).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/materiales/post`,
        data: {
          IdMaterial: null,
          Nombre: material.Nombre,
          Medicion: material.TipoMedicion,
          Captura: material.TipoCaptura,
          Referencia: material.Referencia,
          Factor: material.Factor,
          Aprovechable: material.Aprovechable
        },
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should post tercero successfully', fakeAsync(() => {
      const tercero: Tercero = {
        IdPersona: '',
        Identificacion: '123456789',
        Telefono: '1234567890',
        Nombre: 'Test Tercero'
      };
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 201,
        data: { IdPersona: '123' },
        headers: {},
        url: ''
      }));

      let result = false;
      service.postTercero(tercero).then(res => result = res);
      tick();

      expect(result).toBeTrue();
      expect(tercero.IdPersona).toBe('123');
      expect(CapacitorHttp.post).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/terceros/post`,
        data: {
          IdTercero: null,
          Nombre: tercero.Nombre,
          Identificacion: tercero.Identificacion,
          Correo: tercero.Correo,
          Telefono: tercero.Telefono
        },
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should handle post errors', fakeAsync(() => {
      const embalaje: Embalaje = {
        IdEmbalaje: '',
        Nombre: 'Test Embalaje'
      };
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve({
        status: 400,
        data: {},
        headers: {},
        url: ''
      }));

      let error: any;
      service.postEmbalaje(embalaje).catch(err => error = err);
      tick();

      expect(error.message).toBe('Request error');
    }));

    it('should handle network errors', fakeAsync(() => {
      const embalaje: Embalaje = {
        IdEmbalaje: '',
        Nombre: 'Test Embalaje'
      };
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.reject(new Error('Network error')));

      let error: any;
      service.postEmbalaje(embalaje).catch(err => error = err);
      tick();

      expect(error.message).toBe('Request error: Network error');
    }));
  });
});
