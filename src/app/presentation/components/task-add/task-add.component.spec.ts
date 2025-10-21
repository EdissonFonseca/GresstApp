import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskAddComponent } from './task-add.component';
import { ProcessService } from '@app/application/services/process.service';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { TaskService } from '@app/application/services/task.service';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { Camera, Photo } from '@capacitor/camera';
import { STATUS, SERVICE_TYPES, INPUT_OUTPUT } from '@app/core/constants';
import { Process } from '@app/domain/entities/process.entity';
import { Subprocess } from '@app/domain/entities/subprocess.entity';

describe('TaskAddComponent', () => {
  let component: TaskAddComponent;
  let fixture: ComponentFixture<TaskAddComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let processServiceSpy: jasmine.SpyObj<ProcessService>;
  let subprocessServiceSpy: jasmine.SpyObj<SubprocessService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockActivity: Process = {
    ProcessId: '1',
    ServiceId: SERVICE_TYPES.COLLECTION,
    ResourceId: '1',
    OrderId: '1',
    Title: 'Test Activity',
    StatusId: STATUS.APPROVED,
    ProcessDate: new Date().toISOString(),
    StartDate: new Date().toISOString(),
    EndDate: new Date().toISOString()
  };

  const mockTransaction: Subprocess = {
    SubprocessId: '1',
    ProcessId: '1',
    StatusId: STATUS.APPROVED,
    InputOutput: INPUT_OUTPUT.INPUT,
    ResourceId: '1',
    ServiceId: SERVICE_TYPES.COLLECTION,
    Title: 'Test Transaction'
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    processServiceSpy = jasmine.createSpyObj('ProcessService', ['get']);
    subprocessServiceSpy = jasmine.createSpyObj('SubprocessService', ['getByPoint', 'getByThirdParty', 'create']);
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['create']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error']);

    TestBed.configureTestingModule({
      declarations: [TaskAddComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ProcessService, useValue: processServiceSpy },
        { provide: SubprocessService, useValue: subprocessServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAddComponent);
    component = fixture.componentInstance;
    component.activityId = '1';
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.formData).toBeTruthy();
    expect(component.formData.get('StatusId')?.value).toBe(STATUS.APPROVED);
    expect(component.formData.get('InputOutput')?.value).toBe(INPUT_OUTPUT.INPUT);
  });

  it('should load activity data on init', async () => {
    processServiceSpy.get.and.returnValue(Promise.resolve(mockActivity));
    await component.ngOnInit();
    expect(processServiceSpy.get).toHaveBeenCalledWith('1');
    expect(component.requestPackaging).toBeTrue();
  });

  it('should calculate weight from quantity', () => {
    component.formData.patchValue({
      Measurement: 'WEIGHT',
      Factor: 2
    });
    const event = { target: { value: '10' } };
    component.calculateFromQuantity(event);
    expect(component.formData.get('Weight')?.value).toBe(20);
  });

  it('should calculate volume from quantity', () => {
    component.formData.patchValue({
      Measurement: 'VOLUME',
      Factor: 3
    });
    const event = { target: { value: '10' } };
    component.calculateFromQuantity(event);
    expect(component.formData.get('Volume')?.value).toBe(30);
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
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should delete photo', () => {
    component.photos = ['photo1', 'photo2'];
    component.deletePhoto(0);
    expect(component.photos.length).toBe(1);
    expect(component.photos[0]).toBe('photo2');
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ returnToPrevious: true });
  });

  it('should submit form and create task', async () => {
    processServiceSpy.get.and.returnValue(Promise.resolve(mockActivity));
    subprocessServiceSpy.getByPoint.and.returnValue(Promise.resolve(undefined));
    subprocessServiceSpy.create.and.returnValue(Promise.resolve());
    taskServiceSpy.create.and.returnValue(Promise.resolve());

    component.formData.patchValue({
      MaterialId: '1',
      Quantity: 10,
      InputPointId: '1'
    });

    await component.submit();

    expect(taskServiceSpy.create).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(true);
  });

  it('should handle submit error', async () => {
    processServiceSpy.get.and.returnValue(Promise.resolve(mockActivity));
    taskServiceSpy.create.and.returnValue(Promise.reject('error'));

    component.formData.patchValue({
      MaterialId: '1',
      Quantity: 10
    });

    await component.submit();

    expect(loggerServiceSpy.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should show error for invalid form', async () => {
    await component.submit();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should show error for non-existent activity', async () => {
    processServiceSpy.get.and.returnValue(Promise.resolve(undefined));
    component.formData.patchValue({
      MaterialId: '1',
      Quantity: 10
    });

    await component.submit();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });
});
