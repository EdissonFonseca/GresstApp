import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskEditComponent } from './task-edit.component';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TasksService } from '@app/application/services/task.service';
import { MaterialsService } from '@app/infrastructure/repositories/material.repository';
import { PointsService } from '@app/infrastructure/repositories/facility.repository';
import { ThirdpartiesService } from '@app/infrastructure/repositories/party.repository';
import { PackagingService } from '@app/infrastructure/repositories/package.repository';
import { InventoryService } from '@app/infrastructure/repositories/inventory.repository';
import { SubprocessesService } from '@app/application/services/subprocess.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { Camera, Photo } from '@capacitor/camera';
import { STATUS, MEASUREMENTS, INPUT_OUTPUT } from '@app/core/constants';
import { Task } from '@app/domain/entities/task.entity';
import { Material } from '@app/domain/entities/material.entity';
import { Punto } from '@app/domain/entities/facility.entity';
import { Tercero } from '@app/domain/entities/party.entity';
import { Embalaje } from '@app/domain/entities/package.entity';
import { Residuo } from '@app/domain/entities/waste.entity';

describe('TaskEditComponent', () => {
  let component: TaskEditComponent;
  let fixture: ComponentFixture<TaskEditComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let pointsServiceSpy: jasmine.SpyObj<PointsService>;
  let thirdpartiesServiceSpy: jasmine.SpyObj<ThirdpartiesService>;
  let packagingServiceSpy: jasmine.SpyObj<PackagingService>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let transactionsServiceSpy: jasmine.SpyObj<SubprocessesService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockTask: Task = {
    TaskId: '1',
    ProcessId: '1',
    SubprocessId: '1',
    MaterialId: '1',
    ResidueId: '1',
    ResourceId: '1',
    ServiceId: '1',
    InputOutput: INPUT_OUTPUT.INPUT,
    Quantity: 10,
    Weight: 20,
    Volume: 30,
    PackagingId: '1',
    PointId: '1',
    DestinationPointId: '2',
    ThirdPartyId: '1',
    DestinationThirdPartyId: '2',
    StatusId: STATUS.PENDING,
    ExecutionDate: new Date().toISOString(),
    Photos: [],
    Observations: 'Test observations'
  };

  const mockMaterial: Material = {
    IdMaterial: '1',
    Nombre: 'Test Material',
    TipoMedicion: MEASUREMENTS.WEIGHT,
    TipoCaptura: 'P',
    Factor: 2,
    Aprovechable: true
  };

  const mockPoint: Punto = {
    IdDeposito: '1',
    Nombre: 'Test Point',
    IdPersona: '1',
    IdMateriales: ['1'],
    Tipo: 'P',
    Acopio: true,
    Almacenamiento: true,
    Latitud: '0',
    Longitud: '0',
    Disposicion: true,
    Entrega: true,
    Generacion: true,
    Recepcion: true,
    Tratamiento: true
  };

  const mockThirdParty: Tercero = {
    IdPersona: '1',
    Nombre: 'Test Third Party',
    Identificacion: '123',
    Telefono: '1234567890'
  };

  const mockPackaging: Embalaje = {
    IdEmbalaje: '1',
    Nombre: 'Test Packaging'
  };

  const mockResidue: Residuo = {
    IdResiduo: '1',
    IdMaterial: '1',
    Cantidad: 10,
    Peso: 20,
    Volumen: 30,
    Aprovechable: true,
    IdEstado: STATUS.ACTIVE,
    IdPropietario: '1',
    Ubicacion: 'Test Location'
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['get']);
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['get', 'update']);
    materialsServiceSpy = jasmine.createSpyObj('MaterialsService', ['get']);
    pointsServiceSpy = jasmine.createSpyObj('PointsService', ['get']);
    thirdpartiesServiceSpy = jasmine.createSpyObj('ThirdpartiesService', ['get']);
    packagingServiceSpy = jasmine.createSpyObj('PackagingService', ['get']);
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getResidue']);
    transactionsServiceSpy = jasmine.createSpyObj('SubprocessesService', ['get']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error']);

    TestBed.configureTestingModule({
      declarations: [TaskEditComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: MaterialsService, useValue: materialsServiceSpy },
        { provide: PointsService, useValue: pointsServiceSpy },
        { provide: ThirdpartiesService, useValue: thirdpartiesServiceSpy },
        { provide: PackagingService, useValue: packagingServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: SubprocessesService, useValue: transactionsServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskEditComponent);
    component = fixture.componentInstance;
    component.activityId = '1';
    component.taskId = '1';
    component.materialId = '1';
    component.residueId = '1';
    component.inputOutput = INPUT_OUTPUT.INPUT;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.frmTask).toBeTruthy();
    expect(component.frmTask.get('Cantidad')?.value).toBeNull();
    expect(component.frmTask.get('Peso')?.value).toBeNull();
    expect(component.frmTask.get('Volumen')?.value).toBeNull();
  });

  it('should load task data on init', async () => {
    tasksServiceSpy.get.and.returnValue(Promise.resolve(mockTask));
    materialsServiceSpy.get.and.returnValue(Promise.resolve(mockMaterial));
    pointsServiceSpy.get.and.returnValue(Promise.resolve(mockPoint));
    thirdpartiesServiceSpy.get.and.returnValue(Promise.resolve(mockThirdParty));
    packagingServiceSpy.get.and.returnValue(Promise.resolve(mockPackaging));

    await component.ngOnInit();

    expect(tasksServiceSpy.get).toHaveBeenCalledWith('1');
    expect(materialsServiceSpy.get).toHaveBeenCalledWith('1');
    expect(component.status).toBe(STATUS.PENDING);
    expect(component.measurement).toBe(MEASUREMENTS.WEIGHT);
    expect(component.factor).toBe(2);
  });

  it('should calculate weight from quantity', () => {
    component.measurement = MEASUREMENTS.WEIGHT;
    component.factor = 2;
    const event = { target: { value: '10' } };
    component.calculateFromQuantity(event);
    expect(component.frmTask.get('Peso')?.value).toBe(20);
  });

  it('should calculate volume from quantity', () => {
    component.measurement = MEASUREMENTS.VOLUME;
    component.factor = 3;
    const event = { target: { value: '10' } };
    component.calculateFromQuantity(event);
    expect(component.frmTask.get('Volumen')?.value).toBe(30);
  });

  it('should handle photo capture', async () => {
    const mockImage: Photo = {
      base64String: 'test-base64',
      format: 'jpeg',
      saved: false
    };
    spyOn(Camera, 'getPhoto').and.returnValue(Promise.resolve(mockImage));
    await component.takePhoto();
    expect(component.photos.length).toBe(1);
  });

  it('should handle photo capture error', async () => {
    spyOn(Camera, 'getPhoto').and.returnValue(Promise.reject('error'));
    await component.takePhoto();
    expect(loggerServiceSpy.error).toHaveBeenCalled();
  });

  it('should delete photo', () => {
    component.photos = ['photo1', 'photo2'];
    component.deletePhoto(0);
    expect(component.photos.length).toBe(1);
    expect(component.photos[0]).toBe('photo2');
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should confirm task and update', async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.resolve({
      IdActividad: '1',
      FechaOrden: new Date().toISOString(),
      IdEstado: STATUS.PENDING,
      IdRecurso: '1',
      IdServicio: '1',
      IdTercero: '1',
      NavegarPorTransaccion: true,
      Titulo: 'Test Activity'
    }));
    tasksServiceSpy.get.and.returnValue(Promise.resolve(mockTask));
    tasksServiceSpy.update.and.returnValue(Promise.resolve(true));

    component.frmTask.patchValue({
      Cantidad: 10,
      Peso: 20,
      Volumen: 30
    });

    await component.confirm();

    expect(tasksServiceSpy.update).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should reject task', async () => {
    tasksServiceSpy.get.and.returnValue(Promise.resolve(mockTask));
    tasksServiceSpy.update.and.returnValue(Promise.resolve(true));

    component.frmTask.patchValue({
      Observaciones: 'Rejected'
    });

    await component.reject();

    expect(tasksServiceSpy.update).toHaveBeenCalledWith(jasmine.objectContaining({
      StatusId: STATUS.REJECTED
    }));
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should handle error when confirming task', async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.resolve({
      IdActividad: '1',
      FechaOrden: new Date().toISOString(),
      IdEstado: STATUS.PENDING,
      IdRecurso: '1',
      IdServicio: '1',
      IdTercero: '1',
      NavegarPorTransaccion: true,
      Titulo: 'Test Activity'
    }));
    tasksServiceSpy.get.and.returnValue(Promise.resolve(mockTask));
    tasksServiceSpy.update.and.returnValue(Promise.reject('error'));

    component.frmTask.patchValue({
      Cantidad: 10
    });

    await component.confirm();

    expect(loggerServiceSpy.error).toHaveBeenCalled();
  });
});
