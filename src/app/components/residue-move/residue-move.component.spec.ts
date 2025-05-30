import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ResidueMoveComponent } from './residue-move.component';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { of } from 'rxjs';
import { STATUS } from '@app/constants/constants';
import { Residuo } from '@app/interfaces/residuo.interface';
import { Material } from '@app/interfaces/material.interface';

const mockResidue: Residuo = {
  IdResiduo: '1',
  IdMaterial: '1',
  Material: 'Test Material',
  DepositoOrigen: 'Test Origin',
  FechaIngreso: '2024-01-01',
  Propietario: 'Test Owner',
  Solicitud: 'Test Request',
  Cantidad: 10,
  Peso: 100,
  Volumen: 50,
  IdEstado: STATUS.ACTIVE,
  IdDeposito: '1',
  Aprovechable: true,
  IdPropietario: '1',
  Ubicacion: 'Test Location'
};

const mockMaterial: Material = {
  IdMaterial: '1',
  Nombre: 'Test Material',
  TipoMedicion: 'C',
  Aprovechable: true,
  TipoCaptura: 'M'
};

describe('ResidueMoveComponent', () => {
  let component: ResidueMoveComponent;
  let fixture: ComponentFixture<ResidueMoveComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getResidue', 'updateResidue']);
    materialsServiceSpy = jasmine.createSpyObj('MaterialsService', ['get']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPersonId']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    inventoryServiceSpy.getResidue.and.returnValue(Promise.resolve(mockResidue));
    inventoryServiceSpy.updateResidue.and.returnValue(Promise.resolve(true));
    materialsServiceSpy.get.and.returnValue(Promise.resolve(mockMaterial));
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('1'));

    TestBed.configureTestingModule({
      declarations: [ResidueMoveComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: MaterialsService, useValue: materialsServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavParams, useValue: { get: () => '1' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResidueMoveComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.date).toBeNull();
    expect(component.residueId).toBe('');
    expect(component.target).toBe('');
    expect(component.targetId).toBe('');
    expect(component.vehicle).toBe('');
    expect(component.vehicleId).toBe('');
    expect(component.mode).toBe('');
    expect(component.unidadCantidad).toBe('un');
    expect(component.unidadPeso).toBe('kg');
    expect(component.unidadVolumen).toBe('lt');
  });

  it('should load residue data on initialization', async () => {
    await component.ngOnInit();

    expect(inventoryServiceSpy.getResidue).toHaveBeenCalledWith('1');
    expect(materialsServiceSpy.get).toHaveBeenCalledWith('1');
    expect(component.residue).toEqual(mockResidue);
    expect(component.material).toEqual(mockMaterial);
  });

  it('should handle error when loading residue data', async () => {
    inventoryServiceSpy.getResidue.and.returnValue(Promise.reject(new Error('Test error')));

    await component.ngOnInit();

    expect(component.residue).toBeUndefined();
  });

  it('should handle date change', () => {
    const mockDate = new Date();
    const mockEvent = { detail: { value: mockDate } };

    component.dateTimeChanged(mockEvent);

    expect(component.date).toBe(mockDate);
  });

  it('should confirm residue move', async () => {
    component.residue = mockResidue;
    component.targetId = '2';
    component.vehicleId = '3';

    await component.confirm();

    expect(inventoryServiceSpy.updateResidue).toHaveBeenCalledWith({
      ...mockResidue,
      IdDeposito: '2',
      IdVehiculo: '3'
    });
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      TargetId: '2',
      VehicleId: '3',
      Target: component.target
    });
  });

  it('should not confirm if residue is undefined', async () => {
    component.residue = undefined;
    component.targetId = '2';
    component.vehicleId = '3';

    await component.confirm();

    expect(inventoryServiceSpy.updateResidue).not.toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should select target', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Target' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectTarget();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.targetId).toBe('1');
    expect(component.target).toBe('Test Target');
  });

  it('should select vehicle', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Vehicle' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectVehicle();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.vehicleId).toBe('1');
    expect(component.vehicle).toBe('Test Vehicle');
  });

  it('should change mode', () => {
    component.changeMode('test');
    expect(component.mode).toBe('test');
  });

  it('should handle error when selecting target', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectTarget();

    expect(component.targetId).toBe('');
    expect(component.target).toBe('');
  });

  it('should handle error when selecting vehicle', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectVehicle();

    expect(component.vehicleId).toBe('');
    expect(component.vehicle).toBe('');
  });
});
