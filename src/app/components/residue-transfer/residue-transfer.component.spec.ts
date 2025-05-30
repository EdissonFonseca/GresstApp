import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ResidueTransferComponent } from './residue-transfer.component';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { PointsService } from '@app/services/masterdata/points.service';
import { of } from 'rxjs';
import { STATUS, SERVICE_TYPES, INPUT_OUTPUT } from '@app/constants/constants';

describe('ResidueTransferComponent', () => {
  let component: ResidueTransferComponent;
  let fixture: ComponentFixture<ResidueTransferComponent>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let pointsServiceSpy: jasmine.SpyObj<PointsService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let navParamsSpy: jasmine.SpyObj<NavParams>;

  const mockResidue = {
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

  const mockMaterial = {
    IdMaterial: '1',
    Nombre: 'Test Material',
    TipoMedicion: 'C',
    Aprovechable: true,
    TipoCaptura: 'M'
  };

  const mockPoint = {
    IdDeposito: '1',
    IdMateriales: [],
    IdPersona: '1',
    Nombre: 'Test Point',
    Tipo: 'Test Type',
    Acopio: false,
    Almacenamiento: false,
    Disposicion: false,
    Entrega: false,
    Generacion: false,
    Recepcion: false,
    Tratamiento: false
  };

  beforeEach(waitForAsync(() => {
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['create', 'getByServiceAndResource']);
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['create']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['create', 'getByThirdParty']);
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getResidue', 'updateResidue']);
    materialsServiceSpy = jasmine.createSpyObj('MaterialsService', ['get']);
    pointsServiceSpy = jasmine.createSpyObj('PointsService', ['get']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    navParamsSpy = jasmine.createSpyObj('NavParams', ['get']);

    activitiesServiceSpy.create.and.returnValue(Promise.resolve(true));
    activitiesServiceSpy.getByServiceAndResource.and.returnValue(Promise.resolve(undefined));
    tasksServiceSpy.create.and.returnValue(Promise.resolve(true));
    transactionsServiceSpy.create.and.returnValue(Promise.resolve());
    transactionsServiceSpy.getByThirdParty.and.returnValue(Promise.resolve(undefined));
    inventoryServiceSpy.getResidue.and.returnValue(Promise.resolve(mockResidue));
    inventoryServiceSpy.updateResidue.and.returnValue(Promise.resolve(true));
    materialsServiceSpy.get.and.returnValue(Promise.resolve(mockMaterial));
    pointsServiceSpy.get.and.returnValue(Promise.resolve(mockPoint));
    navParamsSpy.get.and.returnValue('1');

    TestBed.configureTestingModule({
      declarations: [ResidueTransferComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: MaterialsService, useValue: materialsServiceSpy },
        { provide: PointsService, useValue: pointsServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavParams, useValue: navParamsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResidueTransferComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.colorSend).toBe('primary');
    expect(component.colorCarry).toBe('medium');
    expect(component.colorFind).toBe('medium');
    expect(component.date).toBeNull();
    expect(component.material).toBeUndefined();
    expect(component.serviceId).toBe('');
    expect(component.point).toBe('');
    expect(component.pointId).toBe('');
    expect(component.residue).toBeUndefined();
    expect(component.residueId).toBe('1');
    expect(component.stakeholder).toBe('');
    expect(component.stakeholderId).toBe('');
    expect(component.vehicleId).toBe('');
    expect(component.vehicle).toBe('');
  });

  it('should load residue and material data on initialization', async () => {
    await component.ngOnInit();

    expect(inventoryServiceSpy.getResidue).toHaveBeenCalledWith('1');
    expect(materialsServiceSpy.get).toHaveBeenCalledWith('1');
    expect(component.residue).toEqual(mockResidue);
    expect(component.material).toEqual(mockMaterial);
  });

  it('should handle date change', () => {
    const mockDate = new Date();
    const mockEvent = { detail: { value: mockDate } };

    component.dateTimeChanged(mockEvent);

    expect(component.date).toBe(mockDate);
  });

  it('should change service', () => {
    component.changeService('14');
    expect(component.serviceId).toBe('14');
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should select point', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Point', owner: '2' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectPoint();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.pointId).toBe('1');
    expect(component.point).toBe('Test Point');
    expect(component.stakeholderId).toBe('2');
  });

  it('should select stakeholder', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Stakeholder' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectStakeholder();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.stakeholderId).toBe('1');
    expect(component.stakeholder).toBe('Test Stakeholder');
  });

  it('should select vehicle', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Vehicle' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectVehicle();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.vehicleId).toBe('1');
    expect(component.vehicle).toBe('Test Vehicle');
  });

  it('should handle error when selecting point', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectPoint();

    expect(component.pointId).toBe('');
    expect(component.point).toBe('');
    expect(component.stakeholderId).toBe('');
  });

  it('should handle error when selecting stakeholder', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectStakeholder();

    expect(component.stakeholderId).toBe('');
    expect(component.stakeholder).toBe('');
  });

  it('should handle error when selecting vehicle', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectVehicle();

    expect(component.vehicleId).toBe('');
    expect(component.vehicle).toBe('');
  });

  it('should confirm transfer for delivery service', async () => {
    component.serviceId = SERVICE_TYPES.DELIVERY;
    component.stakeholderId = '1';
    component.stakeholder = 'Test Stakeholder';
    component.pointId = '1';
    component.point = 'Test Point';

    await component.confirm();

    expect(activitiesServiceSpy.create).toHaveBeenCalled();
    expect(transactionsServiceSpy.create).toHaveBeenCalled();
    expect(tasksServiceSpy.create).toHaveBeenCalled();
    expect(inventoryServiceSpy.updateResidue).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should confirm transfer for transport service', async () => {
    component.serviceId = SERVICE_TYPES.TRANSPORT;
    component.stakeholderId = '1';
    component.stakeholder = 'Test Stakeholder';
    component.vehicleId = '1';
    component.vehicle = 'Test Vehicle';
    component.pointId = '1';
    component.point = 'Test Point';

    await component.confirm();

    expect(activitiesServiceSpy.create).toHaveBeenCalled();
    expect(transactionsServiceSpy.create).toHaveBeenCalled();
    expect(tasksServiceSpy.create).toHaveBeenCalled();
    expect(inventoryServiceSpy.updateResidue).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });
});
