import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { SupplyPage } from './supply.page';
import { SuppliesService } from '@app/services/masterdata/supplies.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { Insumo } from '@app/interfaces/insumo.interface';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';

describe('SupplyPage', () => {
  let component: SupplyPage;
  let fixture: ComponentFixture<SupplyPage>;
  let suppliesServiceSpy: jasmine.SpyObj<SuppliesService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;

  const mockSupply: Insumo = {
    IdInsumo: '1',
    Nombre: 'Test Supply',
    Descripcion: 'Test Description',
    Cantidad: 100,
    IdEstado: 'active'
  };

  beforeEach(waitForAsync(() => {
    const suppliesSpy = jasmine.createSpyObj('SuppliesService', ['list']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const authSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);

    TestBed.configureTestingModule({
      declarations: [SupplyPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: SuppliesService, useValue: suppliesSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: AuthorizationService, useValue: authSpy }
      ]
    }).compileComponents();

    suppliesServiceSpy = TestBed.inject(SuppliesService) as jasmine.SpyObj<SuppliesService>;
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    authorizationServiceSpy = TestBed.inject(AuthorizationService) as jasmine.SpyObj<AuthorizationService>;

    fixture = TestBed.createComponent(SupplyPage);
    component = fixture.componentInstance;
  }));

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.supplies).toEqual([]);
    expect(component.enableNew).toBe(false);
  });

  it('should load supplies and check permissions on init', fakeAsync(() => {
    const mockSupplies = [mockSupply];
    suppliesServiceSpy.list.and.returnValue(Promise.resolve(mockSupplies));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    component.ngOnInit();
    tick();

    expect(suppliesServiceSpy.list).toHaveBeenCalled();
    expect(authorizationServiceSpy.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_SUPPLY);
    expect(component.supplies).toEqual(mockSupplies);
    expect(component.enableNew).toBe(true);
  }));

  it('should open add supply modal', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: true }));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));
    suppliesServiceSpy.list.and.returnValue(Promise.resolve([mockSupply]));

    component.openAddSupply();
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(modalSpy.present).toHaveBeenCalled();
    expect(suppliesServiceSpy.list).toHaveBeenCalled();
    expect(component.supplies).toEqual([mockSupply]);
  }));

  it('should handle delete supply confirmation', fakeAsync(() => {
    const alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    alertSpy.onDidDismiss.and.returnValue(Promise.resolve({ role: 'confirm' }));
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));
    suppliesServiceSpy.list.and.returnValue(Promise.resolve([]));

    component.deleteSupply(mockSupply);
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Confirm',
      message: 'Are you sure you want to delete this supply?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: jasmine.any(Function)
        }
      ]
    });
    expect(alertSpy.present).toHaveBeenCalled();
    expect(suppliesServiceSpy.list).toHaveBeenCalled();
    expect(component.supplies).toEqual([]);
  }));

  it('should handle delete supply cancellation', fakeAsync(() => {
    const alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    alertSpy.onDidDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));

    component.deleteSupply(mockSupply);
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalled();
    expect(alertSpy.present).toHaveBeenCalled();
    expect(suppliesServiceSpy.list).not.toHaveBeenCalled();
  }));

  it('should handle error when loading supplies', fakeAsync(() => {
    suppliesServiceSpy.list.and.returnValue(Promise.reject(new Error('Test error')));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    component.ngOnInit();
    tick();

    expect(suppliesServiceSpy.list).toHaveBeenCalled();
    expect(component.supplies).toEqual([]);
    expect(component.enableNew).toBe(true);
  }));

  it('should handle error when loading permissions', fakeAsync(() => {
    suppliesServiceSpy.list.and.returnValue(Promise.resolve([mockSupply]));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.reject(new Error('Test error')));

    component.ngOnInit();
    tick();

    expect(authorizationServiceSpy.getPermission).toHaveBeenCalled();
    expect(component.supplies).toEqual([mockSupply]);
    expect(component.enableNew).toBe(false);
  }));
});
