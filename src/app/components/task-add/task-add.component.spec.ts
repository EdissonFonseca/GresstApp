import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskAddComponent } from './task-add.component';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { LoggerService } from '@app/services/core/logger.service';
import { Camera, Photo } from '@capacitor/camera';
import { STATUS, SERVICE_TYPES, INPUT_OUTPUT } from '@app/constants/constants';
import { Actividad } from '@app/interfaces/actividad.interface';
import { Transaccion } from '@app/interfaces/transaccion.interface';

describe('TaskAddComponent', () => {
  let component: TaskAddComponent;
  let fixture: ComponentFixture<TaskAddComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockActivity: Actividad = {
    IdActividad: '1',
    IdServicio: SERVICE_TYPES.COLLECTION,
    IdRecurso: '1',
    IdOrden: '1',
    Titulo: 'Test Activity',
    IdEstado: STATUS.APPROVED,
    FechaOrden: new Date().toISOString(),
    NavegarPorTransaccion: false
  };

  const mockTransaction: Transaccion = {
    IdTransaccion: '1',
    IdActividad: '1',
    IdEstado: STATUS.APPROVED,
    EntradaSalida: INPUT_OUTPUT.INPUT,
    IdRecurso: '1',
    IdServicio: SERVICE_TYPES.COLLECTION,
    Titulo: 'Test Transaction'
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['get']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['getByPoint', 'getByThirdParty', 'create']);
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['create']);
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
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
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
    expect(component.formData.get('IdActividad')?.value).toBe('1');
    expect(component.formData.get('IdEstado')?.value).toBe(STATUS.APPROVED);
    expect(component.formData.get('EntradaSalida')?.value).toBe(INPUT_OUTPUT.INPUT);
  });

  it('should load activity data on init', async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActivity));
    await component.ngOnInit();
    expect(activitiesServiceSpy.get).toHaveBeenCalledWith('1');
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
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActivity));
    transactionsServiceSpy.getByPoint.and.returnValue(Promise.resolve(undefined));
    transactionsServiceSpy.create.and.returnValue(Promise.resolve());
    tasksServiceSpy.create.and.returnValue(Promise.resolve(true));

    component.formData.patchValue({
      MaterialId: '1',
      Quantity: 10,
      InputPointId: '1'
    });

    await component.submit();

    expect(tasksServiceSpy.create).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(true);
  });

  it('should handle submit error', async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActivity));
    tasksServiceSpy.create.and.returnValue(Promise.reject('error'));

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
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(undefined));
    component.formData.patchValue({
      MaterialId: '1',
      Quantity: 10
    });

    await component.submit();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });
});
