import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ResidueDismissComponent } from './residue-dismiss.component';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { of } from 'rxjs';
import { STATUS, INPUT_OUTPUT } from '@app/constants/constants';
import { Residuo } from '@app/interfaces/residuo.interface';
import { Material } from '@app/interfaces/material.interface';
import { Actividad } from '@app/interfaces/actividad.interface';

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

const mockActivity: Actividad = {
  IdActividad: '1',
  IdServicio: '15',
  IdRecurso: '1',
  Titulo: 'Test Activity',
  IdEstado: STATUS.PENDING,
  NavegarPorTransaccion: false,
  FechaInicial: new Date().toISOString(),
  FechaOrden: new Date().toISOString()
};

describe('ResidueDismissComponent', () => {
  let component: ResidueDismissComponent;
  let fixture: ComponentFixture<ResidueDismissComponent>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['getByServiceAndResource', 'create']);
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['create']);
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getResidue', 'updateResidue']);
    materialsServiceSpy = jasmine.createSpyObj('MaterialsService', ['get']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPersonId']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

    activitiesServiceSpy.getByServiceAndResource.and.returnValue(Promise.resolve(mockActivity));
    activitiesServiceSpy.create.and.returnValue(Promise.resolve(true));
    tasksServiceSpy.create.and.returnValue(Promise.resolve(true));
    inventoryServiceSpy.getResidue.and.returnValue(Promise.resolve(mockResidue));
    inventoryServiceSpy.updateResidue.and.returnValue(Promise.resolve(true));
    materialsServiceSpy.get.and.returnValue(Promise.resolve(mockMaterial));
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('1'));

    TestBed.configureTestingModule({
      declarations: [ResidueDismissComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: MaterialsService, useValue: materialsServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavParams, useValue: { get: () => '1' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResidueDismissComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.colorDismiss).toBe('primary');
    expect(component.colorDispose).toBe('medium');
    expect(component.colorStore).toBe('medium');
    expect(component.date).toBeNull();
    expect(component.serviceId).toBe('');
    expect(component.point).toBe('');
    expect(component.pointId).toBe('');
    expect(component.stakeholderId).toBe('');
    expect(component.treatment).toBe('');
    expect(component.treatmentId).toBe('');
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

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al cargar los datos del residuo', 'top');
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should change service and reset fields', () => {
    component.point = 'Test Point';
    component.pointId = '1';
    component.treatment = 'Test Treatment';
    component.treatmentId = '1';

    component.changeService('15');

    expect(component.serviceId).toBe('15');
    expect(component.point).toBe('');
    expect(component.pointId).toBe('');
    expect(component.treatment).toBe('');
    expect(component.treatmentId).toBe('');
  });

  it('should handle date change', () => {
    const mockDate = new Date();
    const mockEvent = { detail: { value: mockDate } };

    component.dateTimeChanged(mockEvent);

    expect(component.date).toBe(mockDate);
  });

  it('should confirm residue dismiss', async () => {
    component.date = new Date();
    component.pointId = '1';
    component.serviceId = '15';
    component.residue = mockResidue;

    await component.confirm();

    expect(activitiesServiceSpy.getByServiceAndResource).toHaveBeenCalledWith('15', '1');
    expect(tasksServiceSpy.create).toHaveBeenCalled();
    expect(inventoryServiceSpy.updateResidue).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ ActivityId: '1' });
  });

  it('should show error when confirming without date', async () => {
    component.pointId = '1';
    component.residue = mockResidue;

    await component.confirm();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Debe seleccionar una fecha', 'top');
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should show error when confirming without point', async () => {
    component.date = new Date();
    component.residue = mockResidue;

    await component.confirm();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Debe seleccionar un punto', 'top');
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should handle error when confirming', async () => {
    component.date = new Date();
    component.pointId = '1';
    component.residue = mockResidue;
    activitiesServiceSpy.getByServiceAndResource.and.returnValue(Promise.reject(new Error('Test error')));

    await component.confirm();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al procesar la solicitud', 'top');
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should select plant', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Plant', owner: '1' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectPlant();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.pointId).toBe('1');
    expect(component.point).toBe('Test Plant');
    expect(component.stakeholderId).toBe('1');
  });

  it('should select store', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Store', owner: '1' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectStore();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.pointId).toBe('1');
    expect(component.point).toBe('Test Store');
    expect(component.stakeholderId).toBe('1');
  });

  it('should select treatment', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Treatment' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectTreatment();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.treatmentId).toBe('1');
    expect(component.treatment).toBe('Test Treatment');
  });

  it('should handle error when selecting plant', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectPlant();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al seleccionar la planta', 'top');
  });

  it('should handle error when selecting store', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectStore();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al seleccionar el almacén', 'top');
  });

  it('should handle error when selecting treatment', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectTreatment();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al seleccionar el tratamiento', 'top');
  });
});
