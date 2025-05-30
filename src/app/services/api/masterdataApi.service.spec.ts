import { TestBed } from '@angular/core/testing';
import { MasterDataApiService } from './masterdataApi.service';
import { HttpService } from './http.service';
import { LoggerService } from '../core/logger.service';
import { Embalaje } from '../../interfaces/embalaje.interface';
import { Insumo } from '../../interfaces/insumo.interface';
import { Material } from '../../interfaces/material.interface';
import { Punto } from '../../interfaces/punto.interface';
import { Servicio } from '../../interfaces/servicio.interface';
import { Tercero } from '../../interfaces/tercero.interface';
import { Tratamiento } from '../../interfaces/tratamiento.interface';
import { Vehiculo } from '../../interfaces/vehiculo.interface';

describe('MasterDataApiService', () => {
  let service: MasterDataApiService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockEmbalaje: Embalaje = {
    IdEmbalaje: '1',
    Nombre: 'Test Package'
  };

  const mockInsumo: Insumo = {
    IdInsumo: '1',
    IdEstado: '1',
    Nombre: 'Test Supply',
    Descripcion: 'Test Description'
  };

  const mockMaterial: Material = {
    IdMaterial: '1',
    Nombre: 'Test Material',
    Aprovechable: true,
    TipoCaptura: 'C',
    TipoMedicion: 'U'
  };

  const mockPunto: Punto = {
    IdDeposito: '1',
    IdMateriales: ['1'],
    IdPersona: '1',
    Nombre: 'Test Point',
    Tipo: 'Test Type',
    Acopio: true,
    Almacenamiento: true,
    Disposicion: true,
    Entrega: true,
    Generacion: true,
    Recepcion: true,
    Tratamiento: true
  };

  const mockServicio: Servicio = {
    IdServicio: '1',
    Nombre: 'Test Service'
  };

  const mockTercero: Tercero = {
    IdPersona: '1',
    Nombre: 'Test Third Party',
    Identificacion: '123456789',
    Telefono: '1234567890'
  };

  const mockTratamiento: Tratamiento = {
    IdTratamiento: '1',
    IdServicio: '1',
    Nombre: 'Test Treatment',
    Descripcion: 'Test Description'
  };

  const mockVehiculo: Vehiculo = {
    IdVehiculo: '1',
    IdMateriales: ['1'],
    Nombre: 'Test Vehicle'
  };

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['get', 'post']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        MasterDataApiService,
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    });

    service = TestBed.inject(MasterDataApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPackaging', () => {
    it('should get all packaging types successfully', async () => {
      const mockResponse = { status: 200, data: [mockEmbalaje] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getPackaging();

      expect(result).toEqual([mockEmbalaje]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/embalajes/get');
    });

    it('should handle error when getting packaging types', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getPackaging()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting packaging types', error);
    });
  });

  describe('getSupplies', () => {
    it('should get all supplies successfully', async () => {
      const mockResponse = { status: 200, data: [mockInsumo] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getSupplies();

      expect(result).toEqual([mockInsumo]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/insumos/get');
    });

    it('should handle error when getting supplies', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getSupplies()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting supplies', error);
    });
  });

  describe('getMaterials', () => {
    it('should get all materials successfully', async () => {
      const mockResponse = { status: 200, data: [mockMaterial] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getMaterials();

      expect(result).toEqual([mockMaterial]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/materiales/getforapp');
    });

    it('should handle error when getting materials', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getMaterials()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting materials', error);
    });
  });

  describe('getPoints', () => {
    it('should get all points successfully', async () => {
      const mockResponse = { status: 200, data: [mockPunto] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getPoints();

      expect(result).toEqual([mockPunto]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/depositos/getpuntos');
    });

    it('should handle error when getting points', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getPoints()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting points', error);
    });
  });

  describe('getServices', () => {
    it('should get all services successfully', async () => {
      const mockResponse = { status: 200, data: [mockServicio] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getServices();

      expect(result).toEqual([mockServicio]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/servicios/get');
    });

    it('should handle error when getting services', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getServices()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting services', error);
    });
  });

  describe('getThirdParties', () => {
    it('should get all third parties successfully', async () => {
      const mockResponse = { status: 200, data: [mockTercero] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getThirdParties();

      expect(result).toEqual([mockTercero]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/terceros/get');
    });

    it('should handle error when getting third parties', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getThirdParties()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting third parties', error);
    });
  });

  describe('getTreatments', () => {
    it('should get all treatments successfully', async () => {
      const mockResponse = { status: 200, data: [mockTratamiento] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getTreatments();

      expect(result).toEqual([mockTratamiento]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/tratamientos/get');
    });

    it('should handle error when getting treatments', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getTreatments()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting treatments', error);
    });
  });

  describe('getVehicles', () => {
    it('should get all vehicles successfully', async () => {
      const mockResponse = { status: 200, data: [mockVehiculo] };
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getVehicles();

      expect(result).toEqual([mockVehiculo]);
      expect(httpServiceSpy.get).toHaveBeenCalledWith('/vehiculos/getautorizados');
    });

    it('should handle error when getting vehicles', async () => {
      const error = new Error('Network error');
      httpServiceSpy.get.and.returnValue(Promise.reject(error));

      await expectAsync(service.getVehicles()).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error getting vehicles', error);
    });
  });

  describe('createPackage', () => {
    it('should create packaging successfully', async () => {
      const mockResponse = { status: 201, data: { IdEmbalaje: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createPackage(mockEmbalaje);

      expect(result).toBeTrue();
      expect(mockEmbalaje.IdEmbalaje).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/embalajes', mockEmbalaje);
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createPackage(mockEmbalaje);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/embalajes', mockEmbalaje);
    });

    it('should handle error when creating packaging', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.createPackage(mockEmbalaje)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating packaging', { packaging: mockEmbalaje, error });
    });
  });

  describe('createPoint', () => {
    it('should create point successfully', async () => {
      const mockResponse = { status: 201, data: { IdPunto: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createPoint(mockPunto);

      expect(result).toBeTrue();
      expect(mockPunto.IdDeposito).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/puntos', mockPunto);
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createPoint(mockPunto);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/puntos', mockPunto);
    });

    it('should handle error when creating point', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.createPoint(mockPunto)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating point', { point: mockPunto, error });
    });
  });

  describe('createSupply', () => {
    it('should create supply successfully', async () => {
      const mockResponse = { status: 201, data: { IdInsumo: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createSupply(mockInsumo);

      expect(result).toBeTrue();
      expect(mockInsumo.IdInsumo).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/insumos', mockInsumo);
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createSupply(mockInsumo);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/insumos', mockInsumo);
    });

    it('should handle error when creating supply', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.createSupply(mockInsumo)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating supply', { supply: mockInsumo, error });
    });
  });

  describe('createMaterial', () => {
    it('should create material successfully', async () => {
      const mockResponse = { status: 201, data: { IdMaterial: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createMaterial(mockMaterial);

      expect(result).toBeTrue();
      expect(mockMaterial.IdMaterial).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/materiales', mockMaterial);
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createMaterial(mockMaterial);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/materiales', mockMaterial);
    });

    it('should handle error when creating material', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.createMaterial(mockMaterial)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating material', { material: mockMaterial, error });
    });
  });

  describe('createThirdParty', () => {
    it('should create third party successfully', async () => {
      const mockResponse = { status: 201, data: { IdPersona: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createThirdParty(mockTercero);

      expect(result).toBeTrue();
      expect(mockTercero.IdPersona).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/terceros', mockTercero);
    });

    it('should return false when creation fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createThirdParty(mockTercero);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/terceros', mockTercero);
    });

    it('should handle error when creating third party', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.createThirdParty(mockTercero)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating third party', { thirdParty: mockTercero, error });
    });
  });

  describe('updatePackage', () => {
    it('should update packaging successfully', async () => {
      const mockResponse = { status: 201, data: { IdEmbalaje: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updatePackage(mockEmbalaje);

      expect(result).toBeTrue();
      expect(mockEmbalaje.IdEmbalaje).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/embalajes', mockEmbalaje);
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updatePackage(mockEmbalaje);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/embalajes', mockEmbalaje);
    });

    it('should handle error when updating packaging', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updatePackage(mockEmbalaje)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating material', { embalaje: mockEmbalaje, error });
    });
  });

  describe('updatePoint', () => {
    it('should update point successfully', async () => {
      const mockResponse = { status: 201, data: { IdPunto: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updatePoint(mockPunto);

      expect(result).toBeTrue();
      expect(mockPunto.IdDeposito).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/puntos', mockPunto);
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updatePoint(mockPunto);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/puntos', mockPunto);
    });

    it('should handle error when updating point', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updatePoint(mockPunto)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating point', { point: mockPunto, error });
    });
  });

  describe('updateSupply', () => {
    it('should update supply successfully', async () => {
      const mockResponse = { status: 201, data: { IdInsumo: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateSupply(mockInsumo);

      expect(result).toBeTrue();
      expect(mockInsumo.IdInsumo).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/insumos', mockInsumo);
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateSupply(mockInsumo);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/insumos', mockInsumo);
    });

    it('should handle error when updating supply', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updateSupply(mockInsumo)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating supply', { supply: mockInsumo, error });
    });
  });

  describe('updateMaterial', () => {
    it('should update material successfully', async () => {
      const mockResponse = { status: 201, data: { IdMaterial: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateMaterial(mockMaterial);

      expect(result).toBeTrue();
      expect(mockMaterial.IdMaterial).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/materiales', mockMaterial);
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateMaterial(mockMaterial);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/materiales', mockMaterial);
    });

    it('should handle error when updating material', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updateMaterial(mockMaterial)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating material', { material: mockMaterial, error });
    });
  });

  describe('updateThirdParty', () => {
    it('should update third party successfully', async () => {
      const mockResponse = { status: 201, data: { IdPersona: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateThirdParty(mockTercero);

      expect(result).toBeTrue();
      expect(mockTercero.IdPersona).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/terceros', mockTercero);
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateThirdParty(mockTercero);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/terceros', mockTercero);
    });

    it('should handle error when updating third party', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updateThirdParty(mockTercero)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating third party', { thirdParty: mockTercero, error });
    });
  });

  describe('updateTreatment', () => {
    it('should update treatment successfully', async () => {
      const mockResponse = { status: 201, data: { IdTratamiento: '1' } };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateTreatment(mockTratamiento);

      expect(result).toBeTrue();
      expect(mockTratamiento.IdTratamiento).toBe('1');
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/tratamientos', mockTratamiento);
    });

    it('should return false when update fails', async () => {
      const mockResponse = { status: 400, data: null };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateTreatment(mockTratamiento);

      expect(result).toBeFalse();
      expect(httpServiceSpy.post).toHaveBeenCalledWith('/masterdata/tratamientos', mockTratamiento);
    });

    it('should handle error when updating treatment', async () => {
      const error = new Error('Network error');
      httpServiceSpy.post.and.returnValue(Promise.reject(error));

      await expectAsync(service.updateTreatment(mockTratamiento)).toBeRejectedWith(error);
      expect(loggerServiceSpy.error).toHaveBeenCalledWith('Error creating material', { treatment: mockTratamiento, error });
    });
  });
});