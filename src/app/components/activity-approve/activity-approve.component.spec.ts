import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivityApproveComponent } from './activity-approve.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { STATUS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ElementRef } from '@angular/core';

describe('ActivityApproveComponent', () => {
  let component: ActivityApproveComponent;
  let fixture: ComponentFixture<ActivityApproveComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockActivity: Actividad = {
    IdActividad: '123',
    IdServicio: '8',
    IdRecurso: 'vehicle1',
    Titulo: 'Test Activity',
    FechaInicial: new Date().toISOString(),
    FechaOrden: new Date().toISOString(),
    IdEstado: STATUS.PENDING,
    NavegarPorTransaccion: true,
    KilometrajeInicial: 100
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['get', 'update', 'getSummary']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        IonicModule.forRoot(),
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        ActivityApproveComponent
      ],
      providers: [
        FormBuilder,
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityApproveComponent);
    component = fixture.componentInstance;
    component.activityId = '123';
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActivity));
    activitiesServiceSpy.getSummary.and.returnValue('Test Summary');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showMileage).toBeTrue();
    expect(component.showName).toBeTrue();
    expect(component.showPin).toBeTrue();
    expect(component.showNotes).toBeTrue();
    expect(component.showSignPad).toBeTrue();
    expect(component.isReject).toBeFalse();
  });

  it('should load activity data on init', async () => {
    await component.ngOnInit();
    expect(activitiesServiceSpy.get).toHaveBeenCalledWith('123');
    expect(component.activity).toEqual(mockActivity);
    expect(component.summary).toBe('Test Summary');
  });

  it('should initialize form with activity data', async () => {
    await component.ngOnInit();
    expect(component.frmActividad.get('Kilometraje')?.value).toBe(mockActivity.KilometrajeFinal);
    expect(component.frmActividad.get('Nombre')?.value).toBe(mockActivity.ResponsableNombre);
    expect(component.frmActividad.get('Identificacion')?.value).toBe(mockActivity.ResponsableIdentificacion);
    expect(component.frmActividad.get('Cargo')?.value).toBe(mockActivity.ResponsableCargo);
    expect(component.frmActividad.get('Observaciones')?.value).toBe(mockActivity.ResponsableObservaciones);
  });

  it('should handle error when loading activity', async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.reject('Error'));
    translateServiceSpy.instant.and.returnValue('Error loading activity');

    await component.ngOnInit();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error loading activity', 'middle');
  });

  it('should initialize signature pad on view enter', () => {
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    component.signatureCanvas = { nativeElement: mockCanvas } as ElementRef;

    component.ionViewDidEnter();

    expect(component['canvas']).toBeTruthy();
    expect(component['ctx']).toBeTruthy();
  });

  it('should handle signature drawing', () => {
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    component.signatureCanvas = { nativeElement: mockCanvas } as ElementRef;
    component.ionViewDidEnter();

    const mockEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
      preventDefault: () => {}
    };

    component.startDrawing(mockEvent);
    expect(component['drawing']()).toBeTrue();

    component.draw(mockEvent);
    expect(component['ctx'].lineTo).toHaveBeenCalled();

    component.endDrawing();
    expect(component['drawing']()).toBeFalse();
  });

  it('should clear signature', () => {
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    component.signatureCanvas = { nativeElement: mockCanvas } as ElementRef;
    component.ionViewDidEnter();

    component.clear();
    expect(component['ctx'].clearRect).toHaveBeenCalled();
    expect(component.frmActividad.get('Firma')?.value).toBeNull();
  });

  it('should get form data with updated values', async () => {
    await component.ngOnInit();
    component.frmActividad.patchValue({
      Kilometraje: 200,
      Nombre: 'Test Name',
      Identificacion: '12345',
      Cargo: 'Test Position',
      Observaciones: 'Test Notes',
      Firma: 'data:image/png;base64,test'
    });

    const result = await component.getFormData();
    expect(result).toBeTruthy();
    expect(result?.KilometrajeFinal).toBe(200);
    expect(result?.ResponsableNombre).toBe('Test Name');
    expect(result?.ResponsableIdentificacion).toBe('12345');
    expect(result?.ResponsableCargo).toBe('Test Position');
    expect(result?.ResponsableObservaciones).toBe('Test Notes');
    expect(result?.ResponsableFirma).toBe('data:image/png;base64,test');
  });

  it('should submit approval successfully', async () => {
    await component.ngOnInit();
    translateServiceSpy.instant.and.returnValue('Approving activity');
    activitiesServiceSpy.update.and.returnValue(Promise.resolve(true));

    await component.submit();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Approving activity');
    expect(activitiesServiceSpy.update).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should submit rejection successfully', async () => {
    component.isReject = true;
    await component.ngOnInit();
    translateServiceSpy.instant.and.returnValue('Rejecting activity');
    activitiesServiceSpy.update.and.returnValue(Promise.resolve(true));

    await component.submit();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Rejecting activity');
    expect(activitiesServiceSpy.update).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should handle error during submission', async () => {
    await component.ngOnInit();
    translateServiceSpy.instant.and.returnValue('Error');
    activitiesServiceSpy.update.and.returnValue(Promise.reject('Error'));

    await component.submit();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error', 'middle');
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should respect visibility flags', async () => {
    component.showMileage = false;
    component.showName = false;
    component.showPin = false;
    component.showNotes = false;
    component.showSignPad = false;

    await component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-item[formControlName="Kilometraje"]')).toBeFalsy();
    expect(compiled.querySelector('ion-item[formControlName="Nombre"]')).toBeFalsy();
    expect(compiled.querySelector('ion-item[formControlName="Identificacion"]')).toBeFalsy();
    expect(compiled.querySelector('ion-item[formControlName="Observaciones"]')).toBeFalsy();
    expect(compiled.querySelector('canvas')).toBeFalsy();
  });
});
