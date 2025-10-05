import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ProcessApproveComponent } from './process-approve.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProcessesService } from '@app/infrastructure/repositories/transactions/processes.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { STATUS } from '@app/core/constants';
import { Proceso } from 'src/app/interfaces/proceso.interface';
import { ElementRef } from '@angular/core';

describe('ProcessApproveComponent', () => {
  let component: ProcessApproveComponent;
  let fixture: ComponentFixture<ProcessApproveComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let processesServiceSpy: jasmine.SpyObj<ProcessesService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockProcess: Proceso = {
    IdProceso: '123',
    IdServicio: '8',
    IdRecurso: 'vehicle1',
    Titulo: 'Test Activity',
    FechaInicial: new Date().toISOString(),
    FechaOrden: new Date().toISOString(),
    IdEstado: STATUS.PENDING,
    NavegarPorTransaccion: true,
    KilometrajeInicial: 100,
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    processesServiceSpy = jasmine.createSpyObj('ProcessesService', ['get', 'update', 'getSummary']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        IonicModule.forRoot(),
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        ProcessApproveComponent
      ],
      providers: [
        FormBuilder,
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ProcessesService, useValue: processesServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessApproveComponent);
    component = fixture.componentInstance;
    component.processId = '123';
    processesServiceSpy.get.and.returnValue(Promise.resolve(mockProcess));
    processesServiceSpy.getSummary.and.returnValue('Test Summary');
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
    expect(processesServiceSpy.get).toHaveBeenCalledWith('123');
    expect(component.process).toEqual(mockProcess);
    expect(component.summary).toBe('Test Summary');
  });

  it('should initialize form with activity data', async () => {
    await component.ngOnInit();
    expect(component.frmActividad.get('Kilometraje')?.value).toBe(mockProcess.KilometrajeFinal);
    expect(component.frmActividad.get('Nombre')?.value).toBe(mockProcess.ResponsableNombre);
    expect(component.frmActividad.get('Identificacion')?.value).toBe(mockProcess.ResponsableIdentificacion);
    expect(component.frmActividad.get('Cargo')?.value).toBe(mockProcess.ResponsableCargo);
    expect(component.frmActividad.get('Observaciones')?.value).toBe(mockProcess.ResponsableObservaciones);
  });

  it('should handle error when loading activity', async () => {
    processesServiceSpy.get.and.returnValue(Promise.reject('Error'));
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
    processesServiceSpy.update.and.returnValue(Promise.resolve(true));

    await component.submit();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Approving activity');
    expect(processesServiceSpy.update).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should submit rejection successfully', async () => {
    component.isReject = true;
    await component.ngOnInit();
    translateServiceSpy.instant.and.returnValue('Rejecting activity');
    processesServiceSpy.update.and.returnValue(Promise.resolve(true));

    await component.submit();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Rejecting activity');
    expect(processesServiceSpy.update).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should handle error during submission', async () => {
    await component.ngOnInit();
    translateServiceSpy.instant.and.returnValue('Error');
    processesServiceSpy.update.and.returnValue(Promise.reject('Error'));

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
