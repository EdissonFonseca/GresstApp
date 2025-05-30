import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ActivityAddComponent } from './activity-add.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SERVICE_TYPES, STATUS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { Actividad } from 'src/app/interfaces/actividad.interface';

describe('ActivityAddComponent', () => {
  let component: ActivityAddComponent;
  let fixture: ComponentFixture<ActivityAddComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['list', 'create']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPersonId']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        IonicModule.forRoot(),
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        ActivityAddComponent
      ],
      providers: [
        FormBuilder,
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavParams, useValue: { get: () => SERVICE_TYPES.TRANSPORT } },
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with transport service type', () => {
    expect(component.idServicio).toBe(SERVICE_TYPES.TRANSPORT);
    expect(component.showTransport).toBeTrue();
  });

  it('should initialize form with required validators', () => {
    expect(component.frmActivity.get('IdRecurso')?.hasValidator(Validators.required)).toBeTrue();
    expect(component.frmActivity.get('Kilometraje')?.hasValidator(Validators.min(0))).toBeTrue();
  });

  it('should show error toast when form is invalid', async () => {
    translateServiceSpy.instant.and.returnValue('Invalid form');
    await component.confirm();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Invalid form', 'middle');
  });

  it('should create activity when form is valid', async () => {
    const mockActivity: Actividad = {
      IdActividad: '123',
      IdServicio: SERVICE_TYPES.TRANSPORT,
      IdRecurso: 'vehicle1',
      Titulo: 'Test Activity',
      FechaInicial: new Date().toISOString(),
      FechaOrden: new Date().toISOString(),
      IdEstado: STATUS.PENDING,
      NavegarPorTransaccion: true,
      KilometrajeInicial: 100
    };

    component.frmActivity.patchValue({
      IdRecurso: 'vehicle1',
      Kilometraje: 100
    });

    activitiesServiceSpy.list.and.returnValue(Promise.resolve([]));
    activitiesServiceSpy.create.and.returnValue(Promise.resolve(true));
    translateServiceSpy.instant.and.returnValue('Creating activity');

    await component.confirm();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Creating activity');
    expect(activitiesServiceSpy.create).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(mockActivity);
  });

  it('should show error toast when activity creation fails', async () => {
    component.frmActivity.patchValue({
      IdRecurso: 'vehicle1',
      Kilometraje: 100
    });

    activitiesServiceSpy.list.and.returnValue(Promise.resolve([]));
    activitiesServiceSpy.create.and.returnValue(Promise.reject('Error'));
    translateServiceSpy.instant.and.returnValue('Error creating activity');

    await component.confirm();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error creating activity', 'middle');
  });

  it('should prevent duplicate transport activities', async () => {
    const existingActivity: Actividad = {
      IdActividad: '123',
      IdServicio: SERVICE_TYPES.TRANSPORT,
      IdRecurso: 'vehicle1',
      Titulo: 'Test Activity',
      FechaInicial: new Date().toISOString(),
      FechaOrden: new Date().toISOString(),
      IdEstado: STATUS.PENDING,
      NavegarPorTransaccion: true
    };

    component.frmActivity.patchValue({
      IdRecurso: 'vehicle1'
    });

    activitiesServiceSpy.list.and.returnValue(Promise.resolve([existingActivity]));
    translateServiceSpy.instant.and.returnValue('Active service exists');

    await component.confirm();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Active service exists', 'middle');
    expect(component.idRecurso).toBe('');
    expect(component.recurso).toBe('');
  });

  it('should change service type when changeService is called', () => {
    component.changeService(SERVICE_TYPES.COLLECTION);
    expect(component.idServicio).toBe(SERVICE_TYPES.COLLECTION);
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should open vehicle selection modal', async () => {
    const mockModal = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { id: 'vehicle1', name: 'Test Vehicle' } })
    } as any;

    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

    await component.selectVehicle();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idRecurso).toBe('vehicle1');
    expect(component.recurso).toBe('Test Vehicle');
    expect(component.frmActivity.get('IdRecurso')?.value).toBe('vehicle1');
  });

  it('should open target point selection modal', async () => {
    const mockModal = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { id: 'point1', name: 'Test Point' } })
    } as any;

    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('person1'));

    await component.selectTarget();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idRecurso).toBe('point1');
    expect(component.recurso).toBe('Test Point');
    expect(component.frmActivity.get('IdRecurso')?.value).toBe('point1');
  });

  it('should open source point selection modal', async () => {
    const mockModal = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { id: 'point1', name: 'Test Point' } })
    } as any;

    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('person1'));

    await component.selectSource();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idRecurso).toBe('point1');
    expect(component.recurso).toBe('Test Point');
    expect(component.frmActivity.get('IdRecurso')?.value).toBe('point1');
  });

  it('should handle errors when selecting vehicle', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));
    translateServiceSpy.instant.and.returnValue('Error selecting vehicle');

    await component.selectVehicle();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error selecting vehicle', 'middle');
  });

  it('should handle errors when selecting target point', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));
    translateServiceSpy.instant.and.returnValue('Error selecting target');
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('person1'));

    await component.selectTarget();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error selecting target', 'middle');
  });

  it('should handle errors when selecting source point', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));
    translateServiceSpy.instant.and.returnValue('Error selecting source');
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('person1'));

    await component.selectSource();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error selecting source', 'middle');
  });
});
