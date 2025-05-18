import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, MenuController, ActionSheetController } from '@ionic/angular';
import { InventoryPage } from './inventory.page';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { Utils } from '@app/utils/utils';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Material } from 'src/app/interfaces/material.interface';
import { CRUD_OPERATIONS, STATUS, PERMISSIONS } from '@app/constants/constants';

describe('InventoryPage', () => {
  let component: InventoryPage;
  let fixture: ComponentFixture<InventoryPage>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let menuControllerSpy: jasmine.SpyObj<MenuController>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let utilsSpy: jasmine.SpyObj<typeof Utils>;

  const mockResiduo: Residuo = {
    IdResiduo: '1',
    IdMaterial: '1',
    IdPropietario: '1',
    IdEstado: STATUS.ACTIVE,
    Aprovechable: true,
    Cantidad: 10,
    Material: 'Test Material',
    Ubicacion: 'Test Location'
  };

  const mockMaterial: Material = {
    IdMaterial: '1',
    Nombre: 'Test Material',
    TipoCaptura: 'MANUAL',
    TipoMedicion: 'UNIDAD',
    Aprovechable: true
  };

  const mockAccount = {
    Id: '1',
    Name: 'Test Account'
  };

  beforeEach(async () => {
    const invSpy = jasmine.createSpyObj('InventoryService', ['list', 'getResiduo']);
    const matSpy = jasmine.createSpyObj('MaterialsService', ['get']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable']);
    const actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const authSpy = jasmine.createSpyObj('AuthorizationService', ['getAccount', 'getPermission']);
    const utilsSpyObj = jasmine.createSpyObj('Utils', ['showToast']);

    await TestBed.configureTestingModule({
      declarations: [InventoryPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: InventoryService, useValue: invSpy },
        { provide: MaterialsService, useValue: matSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: MenuController, useValue: menuSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: AuthorizationService, useValue: authSpy },
        { provide: Utils, useValue: utilsSpyObj }
      ]
    }).compileComponents();

    inventoryServiceSpy = TestBed.inject(InventoryService) as jasmine.SpyObj<InventoryService>;
    materialsServiceSpy = TestBed.inject(MaterialsService) as jasmine.SpyObj<MaterialsService>;
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    menuControllerSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;
    actionSheetControllerSpy = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
    authorizationServiceSpy = TestBed.inject(AuthorizationService) as jasmine.SpyObj<AuthorizationService>;
    utilsSpy = TestBed.inject(Utils) as unknown as jasmine.SpyObj<typeof Utils>;
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

  it('should load account and permissions on init', fakeAsync(() => {
    authorizationServiceSpy.getAccount.and.returnValue(Promise.resolve(mockAccount));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    component.ngOnInit();
    tick();

    expect(authorizationServiceSpy.getAccount).toHaveBeenCalled();
    expect(authorizationServiceSpy.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_INVENTORY);
    expect(component.permiteAgregar).toBe(true);
    expect(menuControllerSpy.enable).toHaveBeenCalledWith(true);
  }));

  it('should load inventory items on ionViewWillEnter', fakeAsync(() => {
    const mockResiduos = [mockResiduo];
    inventoryServiceSpy.list.and.returnValue(Promise.resolve(mockResiduos));

    component.ionViewWillEnter();
    tick();

    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residuos).toEqual(mockResiduos);
  }));

  it('should handle input search', fakeAsync(() => {
    const mockResiduos = [mockResiduo];
    inventoryServiceSpy.list.and.returnValue(Promise.resolve(mockResiduos));
    const mockEvent = { target: { value: 'test' } };

    component.handleInput(mockEvent);
    tick();

    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residuos).toEqual(mockResiduos);
  }));

  it('should open menu with correct actions for active and aprovechable residue', async () => {
    inventoryServiceSpy.getResiduo.and.returnValue(Promise.resolve(mockResiduo));
    materialsServiceSpy.get.and.returnValue(Promise.resolve(mockMaterial));

    await component.openMenu('1');

    expect(inventoryServiceSpy.getResiduo).toHaveBeenCalledWith('1');
    expect(materialsServiceSpy.get).toHaveBeenCalledWith('1');
  });

  it('should handle numeric value check', () => {
    expect(component.isNumeric('123')).toBe(true);
    expect(component.isNumeric('abc')).toBe(false);
    expect(component.isNumeric('')).toBe(false);
  });

  it('should get default image for residue', () => {
    const imagePath = component.getImagen('1');
    expect(imagePath).toBe('../../../assets/img/bagblue.png');
  });

  it('should handle delete residuo', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { success: true } }));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    component.deleteResiduo('1');
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(modalSpy.present).toHaveBeenCalled();
    expect(utilsSpy.showToast).toHaveBeenCalledWith('Residuo eliminado', 'middle');
  }));

  it('should handle move residuo', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { Target: 'New Location' } }));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    component.residuos = [mockResiduo];
    component.moveResiduo('1');
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(modalSpy.present).toHaveBeenCalled();
    expect(component.residuos[0].Ubicacion).toBe('New Location');
    expect(utilsSpy.showToast).toHaveBeenCalledWith('Residuo trasladado', 'middle');
  }));

  it('should handle receive residuo', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: mockResiduo }));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    component.receiveResiduo();
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(modalSpy.present).toHaveBeenCalled();
    expect(component.residuos).toContain(mockResiduo);
    expect(utilsSpy.showToast).toHaveBeenCalledWith('Residuo recibido', 'middle');
  }));

  it('should handle search input', fakeAsync(() => {
    const mockResiduos = [
      { ...mockResiduo, Material: 'Test Material' },
      { ...mockResiduo, Material: 'Other Material' }
    ];
    inventoryServiceSpy.list.and.returnValue(Promise.resolve(mockResiduos));

    const event = { target: { value: 'test' } };
    component.handleInput(event);
    tick();

    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residuos.length).toBe(1);
    expect(component.residuos[0].Material).toBe('Test Material');
  }));
});
