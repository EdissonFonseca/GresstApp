import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InventarioService } from './inventario.service';
import { StorageService } from './storage.service';
import { GlobalesService } from './globales.service';
import { MaterialesService } from './materiales.service';
import { TercerosService } from './terceros.service';
import { PuntosService } from './puntos.service';
import { Residuo } from '../interfaces/residuo.interface';
import { Material } from '../interfaces/material.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { Punto } from '../interfaces/punto.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Cuenta } from '../interfaces/cuenta.interface';
import { TipoServicio } from './constants.service';

describe('InventarioService', () => {
  let service: InventarioService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let globalesServiceSpy: jasmine.SpyObj<GlobalesService>;
  let materialesServiceSpy: jasmine.SpyObj<MaterialesService>;
  let tercerosServiceSpy: jasmine.SpyObj<TercerosService>;
  let puntosServiceSpy: jasmine.SpyObj<PuntosService>;

  const mockResiduos: Residuo[] = [
    {
      IdResiduo: '1',
      IdEstado: '1',
      IdMaterial: '1',
      IdPropietario: '1',
      Aprovechable: true,
      Ubicacion: '',
      Cantidad: 10,
      Peso: 100,
      Volumen: 50
    },
    {
      IdResiduo: '2',
      IdEstado: '1',
      IdMaterial: '2',
      IdPropietario: '2',
      Aprovechable: false,
      Ubicacion: '',
      Cantidad: 20,
      Peso: 200,
      Volumen: 100
    }
  ];

  const mockMateriales: Material[] = [
    {
      IdMaterial: '1',
      Nombre: 'Material 1',
      Aprovechable: true,
      TipoCaptura: '1',
      TipoMedicion: '1'
    },
    {
      IdMaterial: '2',
      Nombre: 'Material 2',
      Aprovechable: false,
      TipoCaptura: '1',
      TipoMedicion: '1'
    }
  ];

  const mockTerceros: Tercero[] = [
    {
      IdPersona: '1',
      Nombre: 'Tercero 1',
      Identificacion: '123',
      Telefono: '123'
    },
    {
      IdPersona: '2',
      Nombre: 'Tercero 2',
      Identificacion: '456',
      Telefono: '456'
    }
  ];

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

  const mockActividades: Actividad[] = [
    {
      IdActividad: '1',
      IdServicio: TipoServicio.Recoleccion,
      IdRecurso: '1',
      IdEstado: '1',
      Titulo: 'Actividad 1',
      FechaOrden: null,
      NavegarPorTransaccion: false
    }
  ];

  const mockCuenta: Cuenta = {
    IdCuenta: '1',
    IdPersonaCuenta: '1',
    IdPersonaUsuario: '1',
    IdUsuario: '1',
    LoginUsuario: 'test',
    NombreCuenta: 'Test',
    NombreUsuario: 'Test User',
    Ajustes: {},
    Parametros: {},
    Permisos: {}
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const globalesSpy = jasmine.createSpyObj('GlobalesService', [], {
      unidadCantidad: 'un',
      unidadPeso: 'kg',
      unidadVolumen: 'lt'
    });
    const materialesSpy = jasmine.createSpyObj('MaterialesService', ['list']);
    const tercerosSpy = jasmine.createSpyObj('TercerosService', ['list']);
    const puntosSpy = jasmine.createSpyObj('PuntosService', ['list']);

    TestBed.configureTestingModule({
      providers: [
        InventarioService,
        { provide: StorageService, useValue: storageSpy },
        { provide: GlobalesService, useValue: globalesSpy },
        { provide: MaterialesService, useValue: materialesSpy },
        { provide: TercerosService, useValue: tercerosSpy },
        { provide: PuntosService, useValue: puntosSpy }
      ]
    });

    service = TestBed.inject(InventarioService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    globalesServiceSpy = TestBed.inject(GlobalesService) as jasmine.SpyObj<GlobalesService>;
    materialesServiceSpy = TestBed.inject(MaterialesService) as jasmine.SpyObj<MaterialesService>;
    tercerosServiceSpy = TestBed.inject(TercerosService) as jasmine.SpyObj<TercerosService>;
    puntosServiceSpy = TestBed.inject(PuntosService) as jasmine.SpyObj<PuntosService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list()', () => {
    it('should return empty array when no residuos exist', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve([]));
      materialesServiceSpy.list.and.returnValue(Promise.resolve(mockMateriales));
      tercerosServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
      puntosServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));

      let result: Residuo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result).toEqual([]);
      expect(storageServiceSpy.get).toHaveBeenCalledWith('Inventario');
    }));

    it('should process residuos with all related data', fakeAsync(() => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockCuenta),
        Promise.resolve(mockActividades),
        Promise.resolve(mockResiduos)
      );
      materialesServiceSpy.list.and.returnValue(Promise.resolve(mockMateriales));
      tercerosServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
      puntosServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));

      let result: Residuo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result.length).toBe(2);
      expect(result[0].Material).toBe('Material 1');
      expect(result[0].Propietario).toBe('Tercero 1');
      expect(result[0].Aprovechable).toBe(true);
      expect(result[0].Cantidades).toBe('10 un/100 kg/50 lt');
    }));

    it('should handle residuo with deposito location', fakeAsync(() => {
      const residuoWithDeposito = {
        ...mockResiduos[0],
        IdDeposito: '1'
      };
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockCuenta),
        Promise.resolve(mockActividades),
        Promise.resolve([residuoWithDeposito])
      );
      materialesServiceSpy.list.and.returnValue(Promise.resolve(mockMateriales));
      tercerosServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
      puntosServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));

      let result: Residuo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result[0].Ubicacion).toBe('Punto 1');
    }));

    it('should handle residuo with vehiculo location', fakeAsync(() => {
      const residuoWithVehiculo = {
        ...mockResiduos[0],
        IdVehiculo: 'VEH001'
      };
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockCuenta),
        Promise.resolve(mockActividades),
        Promise.resolve([residuoWithVehiculo])
      );
      materialesServiceSpy.list.and.returnValue(Promise.resolve(mockMateriales));
      tercerosServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
      puntosServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));

      let result: Residuo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result[0].Ubicacion).toBe('VEH001');
    }));

    it('should handle residuo with ruta location', fakeAsync(() => {
      const residuoWithRuta = {
        ...mockResiduos[0],
        IdRuta: '1'
      };
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockCuenta),
        Promise.resolve(mockActividades),
        Promise.resolve([residuoWithRuta])
      );
      materialesServiceSpy.list.and.returnValue(Promise.resolve(mockMateriales));
      tercerosServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
      puntosServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));

      let result: Residuo[] = [];
      service.list().then(res => result = res);
      tick();

      expect(result[0].Ubicacion).toBe('Actividad 1');
    }));
  });

  describe('getResiduo()', () => {
    it('should return undefined when residuo not found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockCuenta),
        Promise.resolve(mockActividades),
        Promise.resolve(mockResiduos)
      );
      materialesServiceSpy.list.and.returnValue(Promise.resolve(mockMateriales));
      tercerosServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
      puntosServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));

      let result: Residuo | undefined;
      service.getResiduo('999').then(res => result = res);
      tick();

      expect(result).toBeUndefined();
    }));

    it('should return residuo when found', fakeAsync(() => {
      storageServiceSpy.get.and.returnValues(
        Promise.resolve(mockCuenta),
        Promise.resolve(mockActividades),
        Promise.resolve(mockResiduos)
      );
      materialesServiceSpy.list.and.returnValue(Promise.resolve(mockMateriales));
      tercerosServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
      puntosServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));

      let result: Residuo | undefined;
      service.getResiduo('1').then(res => result = res);
      tick();

      expect(result).toBeDefined();
      expect(result?.IdResiduo).toBe('1');
    }));
  });

  describe('createResiduo()', () => {
    it('should create new residuo in empty inventory', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve([]));
      const newResiduo: Residuo = {
        IdResiduo: '3',
        IdEstado: '1',
        IdMaterial: '1',
        IdPropietario: '1',
        Aprovechable: true,
        Ubicacion: ''
      };

      service.createResiduo(newResiduo);
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Inventario', [newResiduo]);
    }));

    it('should add residuo to existing inventory', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockResiduos));
      const newResiduo: Residuo = {
        IdResiduo: '3',
        IdEstado: '1',
        IdMaterial: '1',
        IdPropietario: '1',
        Aprovechable: true,
        Ubicacion: ''
      };

      service.createResiduo(newResiduo);
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Inventario', [...mockResiduos, newResiduo]);
    }));
  });

  describe('updateResiduo()', () => {
    it('should update existing residuo', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockResiduos));
      const updatedResiduo: Residuo = {
        ...mockResiduos[0],
        Cantidad: 15,
        Peso: 150,
        IdDeposito: '2'
      };

      service.updateResiduo(updatedResiduo);
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Inventario', jasmine.any(Array));
      const updatedInventory = (storageServiceSpy.set as jasmine.Spy).calls.mostRecent().args[1];
      const updatedItem = updatedInventory.find((r: Residuo) => r.IdResiduo === '1');
      expect(updatedItem.Cantidad).toBe(15);
      expect(updatedItem.Peso).toBe(150);
      expect(updatedItem.IdDeposito).toBe('2');
      expect(updatedItem.CRUD).toBe('U');
    }));

    it('should not update non-existent residuo', fakeAsync(() => {
      storageServiceSpy.get.and.returnValue(Promise.resolve(mockResiduos));
      const nonExistentResiduo: Residuo = {
        IdResiduo: '999',
        IdEstado: '1',
        IdMaterial: '1',
        IdPropietario: '1',
        Aprovechable: true,
        Ubicacion: ''
      };

      service.updateResiduo(nonExistentResiduo);
      tick();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('Inventario', mockResiduos);
    }));
  });
});
