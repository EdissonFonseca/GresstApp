import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskEditComponent } from './task-edit.component';
import { ProcessService } from '@app/application/services/process.service';
import { TaskService } from '@app/application/services/task.service';
import { MaterialRepository } from '@app/infrastructure/repositories/material.repository';
import { FacilityRepository } from '@app/infrastructure/repositories/facility.repository';
import { PartyRepository } from '@app/infrastructure/repositories/party.repository';
import { PackageRepository } from '@app/infrastructure/repositories/package.repository';
import { InventoryRepository } from '@app/infrastructure/repositories/inventory.repository';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { Camera, Photo } from '@capacitor/camera';
import { STATUS, MEASUREMENTS, INPUT_OUTPUT } from '@app/core/constants';
import { Task } from '@app/domain/entities/task.entity';
import { Material } from '@app/domain/entities/material.entity';
import { Facility } from '@app/domain/entities/facility.entity';
import { Party } from '@app/domain/entities/party.entity';
import { Package } from '@app/domain/entities/package.entity';
import { Waste } from '@app/domain/entities/waste.entity';
import { Process } from '@app/domain/entities/process.entity';

describe('TaskEditComponent', () => {
  let component: TaskEditComponent;
  let fixture: ComponentFixture<TaskEditComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let processServiceSpy: jasmine.SpyObj<ProcessService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let materialRepositorySpy: jasmine.SpyObj<MaterialRepository>;
  let facilityRepositorySpy: jasmine.SpyObj<FacilityRepository>;
  let partyRepositorySpy: jasmine.SpyObj<PartyRepository>;
  let packageRepositorySpy: jasmine.SpyObj<PackageRepository>;
  let inventoryRepositorySpy: jasmine.SpyObj<InventoryRepository>;
  let subprocessServiceSpy: jasmine.SpyObj<SubprocessService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockTask: Task = {
    TaskId: '1',
    ProcessId: '1',
    SubprocessId: '1',
    MaterialId: '1',
    WasteId: '1',
    ResourceId: '1',
    ServiceId: '1',
    InputOutput: INPUT_OUTPUT.INPUT,
    Quantity: 10,
    Weight: 20,
    Volume: 30,
    PackageId: '1',
    FacilityId: '1',
    DestinationFacilityId: '2',
    PartyId: '1',
    DestinationPartyId: '2',
    StatusId: STATUS.PENDING,
    ExecutionDate: new Date().toISOString(),
    Photos: [],
    Notes: 'Test observations',
    Item: 1,
    ScheduledDate: new Date().toISOString(),
    RequestDate: new Date().toISOString(),
    RequestId: 1,
    RequestName: 'Test Request'
  };

  const mockMaterial: Material = {
    Id: '1',
    Name: 'Test Material',
    MeasurementType: MEASUREMENTS.WEIGHT,
    CaptureType: 'P',
    Type: 'P',
    IsRecyclable: true
  };

  const mockFacility: Facility = {
    Id: '1',
    Name: 'Test Facility',
    OwnerId: '1',
    Address: 'Test Address',
    Latitude: '0',
    Longitude: '0',
    IsDelivery: true,
    IsDisposal: true,
    IsGeneration: true,
    IsReception: true,
    IsStorage: true,
    IsTreatment: true,
    IsStockPilling: true,
    IsHeadQuarter: false,
    ParentId: undefined,
    LocationId: undefined,
    Facilities: []
  };

  const mockParty: Party = {
    Id: '1',
    Name: 'Test Party',
    Identification: '123',
    Phone: '1234567890',
    Email: 'test@test.com',
    IsClient: true,
    IsSupplier: false,
    IsEmployee: false
  };

  const mockPackage: Package = {
    Id: '1',
    Name: 'Test Package'
  };

  const mockWaste: Waste = {
    Id: '1',
    MaterialId: '1',
    Quantity: 10,
    Weight: 20,
    Volume: 30,
    IsRecyclable: true,
    StatusId: STATUS.ACTIVE,
    OwnerId: '1',
    FacilityId: '1',
    VehicleId: '1',
    OriginFacilityId: '1',
    PackageQuantity: 0,
    PackageId: '1',
    MaterialName: 'Test Material',
    LocationName: 'Test Location'
  };

  const mockProcess: Process = {
    ProcessId: '1',
    ProcessDate: new Date().toISOString(),
    StatusId: STATUS.PENDING,
    ResourceId: '1',
    ServiceId: '1',
    Title: 'Test Process'
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    processServiceSpy = jasmine.createSpyObj('ProcessService', ['get']);
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['get', 'update']);
    materialRepositorySpy = jasmine.createSpyObj('MaterialRepository', ['get']);
    facilityRepositorySpy = jasmine.createSpyObj('FacilityRepository', ['get']);
    partyRepositorySpy = jasmine.createSpyObj('PartyRepository', ['get']);
    packageRepositorySpy = jasmine.createSpyObj('PackageRepository', ['get']);
    inventoryRepositorySpy = jasmine.createSpyObj('InventoryRepository', ['getResidue']);
    subprocessServiceSpy = jasmine.createSpyObj('SubprocessService', ['get']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error', 'debug', 'info']);

    TestBed.configureTestingModule({
      declarations: [TaskEditComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ProcessService, useValue: processServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: MaterialRepository, useValue: materialRepositorySpy },
        { provide: FacilityRepository, useValue: facilityRepositorySpy },
        { provide: PartyRepository, useValue: partyRepositorySpy },
        { provide: PackageRepository, useValue: packageRepositorySpy },
        { provide: InventoryRepository, useValue: inventoryRepositorySpy },
        { provide: SubprocessService, useValue: subprocessServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskEditComponent);
    component = fixture.componentInstance;
    component.processId = '1';
    component.subprocessId = '1';
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
    taskServiceSpy.get.and.returnValue(Promise.resolve(mockTask));
    materialRepositorySpy.get.and.returnValue(Promise.resolve(mockMaterial));
    facilityRepositorySpy.get.and.returnValue(Promise.resolve(mockFacility));
    partyRepositorySpy.get.and.returnValue(Promise.resolve(mockParty));
    packageRepositorySpy.get.and.returnValue(Promise.resolve(mockPackage));

    await component.ngOnInit();

    expect(taskServiceSpy.get).toHaveBeenCalledWith('1');
    expect(materialRepositorySpy.get).toHaveBeenCalledWith('1');
    expect(component.status).toBe(STATUS.PENDING);
    expect(component.measurement).toBe(MEASUREMENTS.WEIGHT);
  });

  it('should calculate weight from quantity', () => {
    component.measurement = MEASUREMENTS.WEIGHT;
    component.factor = 2;
    const event = { target: { value: '10' } } as any;
    component.calculateFromQuantity(event);
    expect(component.frmTask.get('Peso')?.value).toBe(20);
  });

  it('should calculate volume from quantity', () => {
    component.measurement = MEASUREMENTS.VOLUME;
    component.factor = 3;
    const event = { target: { value: '10' } } as any;
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
    processServiceSpy.get.and.returnValue(Promise.resolve(mockProcess));
    taskServiceSpy.get.and.returnValue(Promise.resolve(mockTask));
    taskServiceSpy.update.and.returnValue(Promise.resolve());

    component.task = mockTask;
    component.frmTask.patchValue({
      Cantidad: 10,
      Peso: 20,
      Volumen: 30
    });

    await component.confirm();

    expect(taskServiceSpy.update).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should reject task', async () => {
    taskServiceSpy.get.and.returnValue(Promise.resolve(mockTask));
    taskServiceSpy.update.and.returnValue(Promise.resolve());

    component.frmTask.patchValue({
      Observaciones: 'Rejected'
    });

    await component.reject();

    expect(taskServiceSpy.update).toHaveBeenCalled();
    const updateCall = taskServiceSpy.update.calls.mostRecent();
    expect(updateCall.args[0].StatusId).toBe(STATUS.REJECTED);
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should handle error when confirming task', async () => {
    processServiceSpy.get.and.returnValue(Promise.resolve(mockProcess));
    taskServiceSpy.get.and.returnValue(Promise.resolve(mockTask));
    taskServiceSpy.update.and.returnValue(Promise.reject('error'));

    component.task = mockTask;
    component.frmTask.patchValue({
      Cantidad: 10
    });

    try {
      await component.confirm();
    } catch (error) {
      // El error se propaga desde taskService.update()
      expect(error).toBe('error');
    }
  });
});
