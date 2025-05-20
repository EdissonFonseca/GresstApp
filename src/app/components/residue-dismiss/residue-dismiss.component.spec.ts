import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ResidueDismissComponent } from './residue-dismiss.component';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { Utils } from '@app/utils/utils';
import { Material } from '@app/interfaces/material.interface';
import { Residuo } from '@app/interfaces/residuo.interface';
import { Actividad } from '@app/interfaces/actividad.interface';
import { Tarea } from '@app/interfaces/tarea.interface';
import { STATUS, CRUD_OPERATIONS, INPUT_OUTPUT } from '@app/constants/constants';

describe('ResidueDismissComponent', () => {
  let component: ResidueDismissComponent;
  let fixture: ComponentFixture<ResidueDismissComponent>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let navParamsSpy: jasmine.SpyObj<NavParams>;

  const mockResidue: Residuo = {
    IdResiduo: '1',
    IdMaterial: '1',
    IdDeposito: '1',
    IdEstado: STATUS.ACTIVE,
    Cantidad: 100,
    Peso: 50,
    Volumen: 25,
    Material: 'Test Material',
    DepositoOrigen: 'Test Origin',
    FechaIngreso: new Date().toISOString(),
    Propietario: 'Test Owner',
    Solicitud: 'Test Request',
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

  const mockActividad: Actividad = {
    IdActividad: '1',
    IdServicio: '15',
    IdRecurso: '1',
    Titulo: 'Test Activity',
    IdEstado: STATUS.PENDING,
    NavegarPorTransaccion: false,
    FechaInicial: new Date().toISOString(),
    FechaOrden: new Date().toISOString()
  };

  beforeEach(async () => {
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['getByServicio', 'create']);
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['create']);
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getResiduo', 'updateResiduo']);
    materialsServiceSpy = jasmine.createSpyObj('MaterialsService', ['get']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPersonId']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    navParamsSpy = jasmine.createSpyObj('NavParams', ['get']);

    activitiesServiceSpy.getByServicio.and.returnValue(Promise.resolve(mockActividad));
    tasksServiceSpy.create.and.returnValue(Promise.resolve());
    inventoryServiceSpy.getResiduo.and.returnValue(Promise.resolve(mockResidue));
    inventoryServiceSpy.updateResiduo.and.returnValue(Promise.resolve());
    materialsServiceSpy.get.and.returnValue(Promise.resolve(mockMaterial));
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('1'));
    navParamsSpy.get.and.returnValue('1');

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ResidueDismissComponent
      ],
      providers: [
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: MaterialsService, useValue: materialsServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavParams, useValue: navParamsSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResidueDismissComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

    expect(inventoryServiceSpy.getResiduo).toHaveBeenCalledWith('1');
    expect(materialsServiceSpy.get).toHaveBeenCalledWith('1');
    expect(component.residue).toEqual(mockResidue);
    expect(component.material).toEqual(mockMaterial);
  });

  it('should handle error when loading residue data', async () => {
    spyOn(Utils, 'showToast');
    spyOn(component, 'cancel');
    inventoryServiceSpy.getResiduo.and.returnValue(Promise.reject(new Error('Test error')));

    await component.ngOnInit();

    expect(Utils.showToast).toHaveBeenCalledWith('Error al cargar los datos del residuo', 'top');
    expect(component.cancel).toHaveBeenCalled();
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
    spyOn(Utils, 'showToast');
    component.date = new Date();
    component.pointId = '1';
    component.serviceId = '15';

    await component.confirm();

    expect(activitiesServiceSpy.getByServicio).toHaveBeenCalledWith('15', '1');
    expect(tasksServiceSpy.create).toHaveBeenCalled();
    expect(inventoryServiceSpy.updateResiduo).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ ActivityId: '1' });
  });

  it('should show error when confirming without date', async () => {
    spyOn(Utils, 'showToast');
    component.pointId = '1';

    await component.confirm();

    expect(Utils.showToast).toHaveBeenCalledWith('Debe seleccionar una fecha', 'top');
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should show error when confirming without point', async () => {
    spyOn(Utils, 'showToast');
    component.date = new Date();

    await component.confirm();

    expect(Utils.showToast).toHaveBeenCalledWith('Debe seleccionar un punto', 'top');
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should handle error when confirming', async () => {
    spyOn(Utils, 'showToast');
    spyOn(console, 'error');
    component.date = new Date();
    component.pointId = '1';
    activitiesServiceSpy.getByServicio.and.returnValue(Promise.reject(new Error('Test error')));

    await component.confirm();

    expect(console.error).toHaveBeenCalledWith('Error confirming residue dismiss:', jasmine.any(Error));
    expect(Utils.showToast).toHaveBeenCalledWith('Error al procesar la solicitud', 'top');
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });
});
