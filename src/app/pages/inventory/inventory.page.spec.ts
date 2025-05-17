import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, MenuController, ActionSheetController } from '@ionic/angular';
import { InventoryPage } from './inventory.page';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
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

  beforeEach(async () => {
    const invSpy = jasmine.createSpyObj('InventoryService', ['list', 'getResiduo']);
    const matSpy = jasmine.createSpyObj('MaterialsService', ['get']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const menuSpy = jasmine.createSpyObj('MenuController', ['enable']);
    const actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);

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
        { provide: ActionSheetController, useValue: actionSheetSpy }
      ]
    }).compileComponents();

    inventoryServiceSpy = TestBed.inject(InventoryService) as jasmine.SpyObj<InventoryService>;
    materialsServiceSpy = TestBed.inject(MaterialsService) as jasmine.SpyObj<MaterialsService>;
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    menuControllerSpy = TestBed.inject(MenuController) as jasmine.SpyObj<MenuController>;
    actionSheetControllerSpy = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
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

  it('should load inventory items on ionViewWillEnter', fakeAsync(() => {
    const mockResiduos = [mockResiduo];
    inventoryServiceSpy.list.and.returnValue(Promise.resolve(mockResiduos));

    component.ionViewWillEnter();
    tick();

    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residuos).toEqual(mockResiduos);
  }));

  it('should check permissions on init', fakeAsync(() => {
    spyOn(Utils, 'getAccount').and.returnValue(Promise.resolve({}));
    spyOn(Utils, 'getPermission').and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    component.ngOnInit();
    tick();

    expect(Utils.getAccount).toHaveBeenCalled();
    expect(Utils.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_INVENTORY);
    expect(component.permiteAgregar).toBe(true);
    expect(menuControllerSpy.enable).toHaveBeenCalledWith(true);
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
});
