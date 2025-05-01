import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GlobalesService } from './globales.service';
import { StorageService } from './storage.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Cuenta } from '../interfaces/cuenta.interface';
import { Ajustes, CRUDOperacion, Estado, EntradaSalida, Parametros, Permisos, TipoServicio } from './constants.service';

describe('GlobalesService', () => {
  let service: GlobalesService;
  let storageService: jasmine.SpyObj<StorageService>;
  let alertController: jasmine.SpyObj<AlertController>;
  let loadingController: jasmine.SpyObj<LoadingController>;
  let toastController: jasmine.SpyObj<ToastController>;

  const mockCuenta: Cuenta = {
    IdCuenta: '1',
    IdPersonaCuenta: '1',
    IdPersonaUsuario: '1',
    IdUsuario: '1',
    LoginUsuario: 'test',
    NombreCuenta: 'Test Account',
    NombreUsuario: 'Test User',
    Parametros: {
      [Parametros.FotosPorMaterial]: '2',
      [Parametros.Moneda]: '$',
      [Parametros.UnidadCantidad]: 'un',
      [Parametros.UnidadCombustible]: 'gl',
      [Parametros.UnidadKilometraje]: 'km',
      [Parametros.UnidadPeso]: 'kg',
      [Parametros.UnidadVolumen]: 'lt'
    },
    Ajustes: {
      [Ajustes.SolicitarKilometraje]: 'true'
    },
    Permisos: {
      [Permisos.AppAcopio]: CRUDOperacion.Create,
      [Permisos.AppTransporte]: CRUDOperacion.Create
    }
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create', 'dismiss']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);

    TestBed.configureTestingModule({
      providers: [
        GlobalesService,
        { provide: StorageService, useValue: storageSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: ToastController, useValue: toastSpy }
      ]
    });

    service = TestBed.inject(GlobalesService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    alertController = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    loadingController = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;

    storageService.get.and.returnValue(Promise.resolve(mockCuenta));
  });

  afterEach(() => {
    storageService.get.calls.reset();
    alertController.create.calls.reset();
    loadingController.create.calls.reset();
    toastController.create.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initGlobales', () => {
    it('should initialize global variables from account data', fakeAsync(() => {
      service.initGlobales();
      tick();

      expect(service.fotosPorMaterial).toBe(2);
      expect(service.moneda).toBe('$');
      expect(service.unidadCantidad).toBe('un');
      expect(service.unidadCombustible).toBe('gl');
      expect(service.unidadKilometraje).toBe('km');
      expect(service.unidadPeso).toBe('kg');
      expect(service.unidadVolumen).toBe('lt');
      expect(service.solicitarKilometraje).toBeTrue();
    }));

    it('should handle missing account data', fakeAsync(() => {
      storageService.get.and.returnValue(Promise.resolve(null));
      service.initGlobales();
      tick();

      expect(service.fotosPorMaterial).toBe(2); // Default value
      expect(service.solicitarKilometraje).toBeFalse();
    }));
  });

  describe('getCurrentPosition', () => {
    it('should return current position coordinates', async () => {
      spyOn(Geolocation, 'getCurrentPosition').and.returnValue(
        Promise.resolve({
          coords: {
            latitude: 10,
            longitude: 20,
            accuracy: 0,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: 0
        })
      );

      const [latitude, longitude] = await service.getCurrentPosition();
      expect(latitude).toBe(10);
      expect(longitude).toBe(20);
    });

    it('should return null coordinates on error', async () => {
      spyOn(Geolocation, 'getCurrentPosition').and.returnValue(
        Promise.reject('Location error')
      );

      const [latitude, longitude] = await service.getCurrentPosition();
      expect(latitude).toBeNull();
      expect(longitude).toBeNull();
    });
  });

  describe('UI Controls', () => {
    it('should present alert', fakeAsync(() => {
      const mockAlert = {
        present: jasmine.createSpy('present'),
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
        animated: true,
        backdropDismiss: true
      } as any;
      alertController.create.and.returnValue(Promise.resolve(mockAlert));

      service.presentAlert('Header', 'Subheader', 'Message');
      tick();

      expect(alertController.create).toHaveBeenCalledWith({
        header: 'Header',
        subHeader: 'Subheader',
        message: 'Message',
        buttons: ['OK']
      });
      expect(mockAlert.present).toHaveBeenCalled();
    }));

    it('should present toast', fakeAsync(() => {
      const mockToast = {
        present: jasmine.createSpy('present'),
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
        animated: true,
        dismiss: jasmine.createSpy('dismiss')
      } as any;
      toastController.create.and.returnValue(Promise.resolve(mockToast));

      service.presentToast('Message', 'bottom');
      tick();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Message',
        duration: 1500,
        position: 'bottom'
      });
      expect(mockToast.present).toHaveBeenCalled();
    }));

    it('should show and hide loading', fakeAsync(() => {
      const mockLoading = {
        present: jasmine.createSpy('present'),
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
        animated: true,
        backdropDismiss: true
      } as any;
      loadingController.create.and.returnValue(Promise.resolve(mockLoading));

      service.showLoading('Loading...');
      tick();

      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Loading...'
      });
      expect(mockLoading.present).toHaveBeenCalled();

      service.hideLoading();
      expect(loadingController.dismiss).toHaveBeenCalled();
    }));
  });

  describe('Service Information', () => {
    it('should get account information', async () => {
      const cuenta = await service.getCuenta();
      expect(cuenta).toEqual(mockCuenta);
    });

    it('should get user ID', async () => {
      const userId = await service.getIdPersona();
      expect(userId).toBe('1');
    });

    it('should get service name', () => {
      const nombre = service.getNombreServicio(TipoServicio.Acopio);
      expect(nombre).toBe('Acopio');
    });

    it('should return empty string for unknown service', () => {
      const nombre = service.getNombreServicio('unknown');
      expect(nombre).toBe('');
    });

    it('should get service image', () => {
      const imagen = service.getImagen(TipoServicio.Acopio);
      expect(imagen).toBe('../../assets/icon/warehouse.svg');
    });

    it('should return empty string for unknown service image', () => {
      const imagen = service.getImagen('unknown');
      expect(imagen).toBe('');
    });
  });

  describe('Permissions and Settings', () => {
    it('should check if service is allowed', async () => {
      const mockServicios = [{ IdServicio: TipoServicio.Acopio }];
      storageService.get.and.returnValue(Promise.resolve(mockServicios));

      const isAllowed = await service.allowServicio(TipoServicio.Acopio);
      expect(isAllowed).toBeTrue();
    });

    it('should return false for unauthorized service', async () => {
      const mockServicios = [{ IdServicio: TipoServicio.Transporte }];
      storageService.get.and.returnValue(Promise.resolve(mockServicios));

      const isAllowed = await service.allowServicio(TipoServicio.Acopio);
      expect(isAllowed).toBeFalse();
    });

    it('should check if adding activity is allowed', async () => {
      const canAdd = await service.allowAddActivity();
      expect(canAdd).toBeTrue();
    });

    it('should get setting value', async () => {
      const setting = await service.getAjuste(Ajustes.SolicitarKilometraje);
      expect(setting).toBe('true');
    });

    it('should get parameter value', async () => {
      const param = await service.getParametro(Parametros.Moneda);
      expect(param).toBe('$');
    });

    it('should get permission value', async () => {
      const permission = await service.getPermiso(Permisos.AppAcopio);
      expect(permission).toBe(CRUDOperacion.Create);
    });
  });

  describe('Utility Functions', () => {
    it('should generate new UUID', () => {
      const id = service.newId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('should return today\'s date without time', () => {
      const today = service.today();
      const now = new Date();

      expect(today.getFullYear()).toBe(now.getFullYear());
      expect(today.getMonth()).toBe(now.getMonth());
      expect(today.getDate()).toBe(now.getDate());
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
      expect(today.getSeconds()).toBe(0);
      expect(today.getMilliseconds()).toBe(0);
    });

    it('should get entrada/salida action', () => {
      expect(service.getAccionEntradaSalida(EntradaSalida.Entrada)).toBe('Recoger');
      expect(service.getAccionEntradaSalida(EntradaSalida.Salida)).toBe('Entregar');
      expect(service.getAccionEntradaSalida(EntradaSalida.Transferencia)).toBe('Recoger y Entregar');
    });
  });
});
