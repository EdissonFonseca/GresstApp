import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { SupplyPage } from './supply.page';
import { SuppliesService } from '@app/services/masterdata/supplies.service';
import { Insumo } from '@app/interfaces/insumo.interface';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';

describe('SupplyPage', () => {
  let component: SupplyPage;
  let fixture: ComponentFixture<SupplyPage>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let suppliesServiceSpy: jasmine.SpyObj<SuppliesService>;

  const mockInsumo: Insumo = {
    IdInsumo: '1',
    Nombre: 'Test Supply',
    IdEstado: 'A'
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    suppliesServiceSpy = jasmine.createSpyObj('SuppliesService', ['list', 'create']);

    TestBed.configureTestingModule({
      declarations: [SupplyPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: SuppliesService, useValue: suppliesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplyPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty supplies array', () => {
    expect(component.supplies).toEqual([]);
  });

  it('should load supplies and check permissions on initialization', fakeAsync(async () => {
    const mockSupplies = [mockInsumo];
    suppliesServiceSpy.list.and.returnValue(Promise.resolve(mockSupplies));
    spyOn(Utils, 'getPermission').and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    await component.ngOnInit();
    tick();

    expect(suppliesServiceSpy.list).toHaveBeenCalled();
    expect(component.supplies).toEqual(mockSupplies);
    expect(Utils.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_SUPPLY);
    expect(component.enableNew).toBeTrue();
  }));

  it('should disable new supply creation when user lacks permission', fakeAsync(async () => {
    suppliesServiceSpy.list.and.returnValue(Promise.resolve([]));
    spyOn(Utils, 'getPermission').and.returnValue(Promise.resolve(''));

    await component.ngOnInit();
    tick();

    expect(component.enableNew).toBeFalse();
  }));

  it('should open add supply modal', fakeAsync(async () => {
    const mockModal: any = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: true }))
    };

    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));
    suppliesServiceSpy.list.and.returnValue(Promise.resolve([mockInsumo]));

    await component.openAddSupply();
    tick();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith({
      component: jasmine.any(Function)
    });
    expect(mockModal.present).toHaveBeenCalled();
    expect(suppliesServiceSpy.list).toHaveBeenCalled();
    expect(component.supplies).toEqual([mockInsumo]);
  }));

  it('should not refresh supplies when modal is dismissed without data', fakeAsync(async () => {
    const mockModal: any = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: null }))
    };

    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));
    suppliesServiceSpy.list.and.returnValue(Promise.resolve([]));

    await component.openAddSupply();
    tick();

    expect(suppliesServiceSpy.list).not.toHaveBeenCalled();
  }));

  it('should show confirmation alert when deleting supply', fakeAsync(async () => {
    const mockAlert: any = {
      present: jasmine.createSpy('present')
    };

    alertCtrlSpy.create.and.returnValue(Promise.resolve(mockAlert));
    suppliesServiceSpy.list.and.returnValue(Promise.resolve([]));

    await component.deleteSupply(mockInsumo);
    tick();

    expect(alertCtrlSpy.create).toHaveBeenCalledWith({
      header: 'Confirm',
      message: 'Are you sure you want to delete this supply?',
      buttons: jasmine.any(Array)
    });
    expect(mockAlert.present).toHaveBeenCalled();
  }));

  it('should refresh supplies list after successful deletion', fakeAsync(async () => {
    const mockAlert: any = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ role: 'confirm' }))
    };

    alertCtrlSpy.create.and.returnValue(Promise.resolve(mockAlert));
    suppliesServiceSpy.list.and.returnValue(Promise.resolve([]));

    await component.deleteSupply(mockInsumo);
    tick();

    expect(suppliesServiceSpy.list).toHaveBeenCalled();
  }));
});
