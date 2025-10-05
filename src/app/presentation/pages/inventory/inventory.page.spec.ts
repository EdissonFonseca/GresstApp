import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, MenuController, ActionSheetController } from '@ionic/angular';
import { InventoryPage } from './inventory.page';
import { InventoryService } from '@app/infrastructure/repositories/transactions/inventory.repository';
import { MaterialsService } from '@app/infrastructure/repositories/masterdata/materials.repository';
import { AuthorizationService } from '@app/infrastructure/repositories/masterdata/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Residuo } from '@app/domain/entities/residuo.entity';
import { Material } from '@app/domain/entities/material.entity';
import { CRUD_OPERATIONS, STATUS, PERMISSIONS } from '@app/core/constants';

describe('InventoryPage', () => {
  let component: InventoryPage;
  let fixture: ComponentFixture<InventoryPage>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let menuControllerSpy: jasmine.SpyObj<MenuController>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;

  const mockResiduo: Residuo = {
    IdResiduo: '1',
    IdMaterial: '1',
    Material: 'Test Material',
    Cantidad: 100,
    Ubicacion: 'Test Location',
    IdEstado: STATUS.ACTIVE,
    Aprovechable: true,
    IdPropietario: '1'
  };

  const mockMaterial: Material = {
    IdMaterial: '1',
    Nombre: 'Test Material',
    Aprovechable: true,
    TipoCaptura: 'MANUAL',
    TipoMedicion: 'UNIDAD'
  };

  beforeEach(async () => {
    const inventorySpy = jasmine.createSpyObj('InventoryService', ['list', 'getResidue']);
    const materialsSpy = jasmine.createSpyObj('MaterialsService', ['get']);
    const authorizationSpy = jasmine.createSpyObj('AuthorizationService', ['getAccount', 'getPermission']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable']);
    const actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const notificationSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);

    await TestBed.configureTestingModule({
      declarations: [InventoryPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: InventoryService, useValue: inventorySpy },
        { provide: MaterialsService, useValue: materialsSpy },
        { provide: AuthorizationService, useValue: authorizationSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: MenuController, useValue: menuSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: UserNotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    inventoryServiceSpy = TestBed.inject(InventoryService) as jasmine.SpyObj<InventoryService>;
    materialsServiceSpy = TestBed.inject(MaterialsService) as jasmine.SpyObj<MaterialsService>;
    authorizationServiceSpy = TestBed.inject(AuthorizationService) as jasmine.SpyObj<AuthorizationService>;
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    menuControllerSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;
    actionSheetControllerSpy = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
    userNotificationServiceSpy = TestBed.inject(UserNotificationService) as jasmine.SpyObj<UserNotificationService>;

    inventoryServiceSpy.list.and.returnValue(Promise.resolve([mockResiduo]));
    inventoryServiceSpy.getResidue.and.returnValue(Promise.resolve(mockResiduo));
    materialsServiceSpy.get.and.returnValue(Promise.resolve(mockMaterial));
    authorizationServiceSpy.getAccount.and.returnValue(Promise.resolve({ IdCuenta: '1' }));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.residuos).toEqual([]);
    expect(component.imagePath).toBe('');
    expect(component.permiteAgregar).toBe(true);
  });

  it('should load data on init', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(authorizationServiceSpy.getAccount).toHaveBeenCalled();
    expect(authorizationServiceSpy.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_INVENTORY);
    expect(menuControllerSpy.enable).toHaveBeenCalledWith(true);
  }));

  it('should load residues on ionViewWillEnter', fakeAsync(() => {
    component.ionViewWillEnter();
    tick();

    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residuos).toEqual([mockResiduo]);
  }));

  it('should handle move residue', fakeAsync(() => {
    const mockModal = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { Target: 'New Location' } })
    };
    modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    component.moveResiduo('1');
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Residuo trasladado', 'middle');
  }));

  it('should handle receive residue', fakeAsync(() => {
    const mockModal = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: mockResiduo })
    };
    modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    component.receiveResiduo();
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(component.residuos).toContain(mockResiduo);
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Residuo recibido', 'middle');
  }));

  it('should handle share residue', fakeAsync(() => {
    const mockModal = {
      present: () => Promise.resolve()
    };
    modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    component.shareResiduo('1');
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
  }));

  it('should handle transfer residue', fakeAsync(() => {
    const mockModal = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { ActivityId: '1' } })
    };
    modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    component.transferResiduo('1');
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
  }));

  it('should handle transform residue', fakeAsync(() => {
    const mockModal = {
      present: () => Promise.resolve()
    };
    modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    component.transformResiduo('1');
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
  }));

  it('should filter residues on input', fakeAsync(() => {
    const mockEvent = { target: { value: 'test' } };
    inventoryServiceSpy.list.and.returnValue(Promise.resolve([mockResiduo]));

    component.handleInput(mockEvent);
    tick();

    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residuos).toEqual([mockResiduo]);
  }));

  it('should open menu for active residue', fakeAsync(() => {
    const mockActionSheet = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { action: 'move' } })
    };
    actionSheetControllerSpy.create.and.returnValue(Promise.resolve(mockActionSheet as any));

    component.openMenu('1');
    tick();

    expect(inventoryServiceSpy.getResidue).toHaveBeenCalledWith('1');
    expect(materialsServiceSpy.get).toHaveBeenCalledWith('1');
    expect(actionSheetControllerSpy.create).toHaveBeenCalled();
  }));

  it('should handle menu action for move', fakeAsync(() => {
    const mockActionSheet = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { action: 'move' } })
    };
    actionSheetControllerSpy.create.and.returnValue(Promise.resolve(mockActionSheet as any));

    spyOn(component, 'moveResiduo');

    component.openMenu('1');
    tick();

    expect(component.moveResiduo).toHaveBeenCalledWith('1');
  }));

  it('should handle menu action for transfer', fakeAsync(() => {
    const mockActionSheet = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { action: 'transfer' } })
    };
    actionSheetControllerSpy.create.and.returnValue(Promise.resolve(mockActionSheet as any));

    spyOn(component, 'transferResiduo');

    component.openMenu('1');
    tick();

    expect(component.transferResiduo).toHaveBeenCalledWith('1');
  }));

  it('should handle menu action for transform', fakeAsync(() => {
    const mockActionSheet = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { action: 'transform' } })
    };
    actionSheetControllerSpy.create.and.returnValue(Promise.resolve(mockActionSheet as any));

    spyOn(component, 'transformResiduo');

    component.openMenu('1');
    tick();

    expect(component.transformResiduo).toHaveBeenCalledWith('1');
  }));

  it('should handle menu action for share', fakeAsync(() => {
    const mockActionSheet = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { action: 'share' } })
    };
    actionSheetControllerSpy.create.and.returnValue(Promise.resolve(mockActionSheet as any));

    spyOn(component, 'shareResiduo');

    component.openMenu('1');
    tick();

    expect(component.shareResiduo).toHaveBeenCalledWith('1');
  }));
});
