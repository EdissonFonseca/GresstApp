import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { SubprocessApproveComponent } from './subprocess-approve.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { TaskService } from '@app/application/services/task.service';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { STATUS } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { Subprocess } from '@app/domain/entities/subprocess.entity';
import { ElementRef } from '@angular/core';

describe('SubprocessApproveComponent', () => {
  let component: SubprocessApproveComponent;
  let fixture: ComponentFixture<SubprocessApproveComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let subprocessServiceSpy: jasmine.SpyObj<SubprocessService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockTransaction: Subprocess = {
    SubprocessId: '1',
    ProcessId: '1',
    ResourceId: '1',
    ServiceId: '1',
    StatusId: STATUS.PENDING,
    Title: 'Test Transaction',
    ResponsiblePosition: 'Test Position',
    ResponsibleIdentification: '123',
    ResponsibleName: 'Test Name',
    ResponsibleNotes: 'Test Notes',
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    subprocessServiceSpy = jasmine.createSpyObj('SubprocessService', ['get', 'update']);
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['listByProcessAndSubprocess', 'update']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showLoading', 'hideLoading', 'showToast']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      declarations: [SubprocessApproveComponent],
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: SubprocessService, useValue: subprocessServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubprocessApproveComponent);
    component = fixture.componentInstance;
    component.transactionId = '1';
    component.activityId = '1';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showMileage).toBeTrue();
    expect(component.showName).toBeTrue();
    expect(component.showNotes).toBeTrue();
    expect(component.showPosition).toBeTrue();
    expect(component.showPin).toBeTrue();
    expect(component.showSignPad).toBeTrue();
    expect(component.isReject).toBeFalse();
  });

  it('should load subprocess data on init', async () => {
    subprocessServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    await component.ngOnInit();
    expect(subprocessServiceSpy.get).toHaveBeenCalledWith('1', '1');
    expect(component.transaction()).toEqual(mockTransaction);
  });

  it('should initialize form with subprocess data', async () => {
    subprocessServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    await component.ngOnInit();
    expect(component.frmTransaction.get('Kilometraje')?.value).toBe(100);
    expect(component.frmTransaction.get('Nombre')?.value).toBe('Test Name');
    expect(component.frmTransaction.get('Identificacion')?.value).toBe('123');
    expect(component.frmTransaction.get('Cargo')?.value).toBe('Test Position');
    expect(component.frmTransaction.get('Observaciones')?.value).toBe('Test Notes');
  });

  it('should handle signature pad initialization', () => {
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

    const mockTouchEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
      preventDefault: jasmine.createSpy('preventDefault')
    };

    component.startDrawing(mockTouchEvent);
    expect(component['drawing']).toBeTrue();

    component.draw(mockTouchEvent);
    expect(mockTouchEvent.preventDefault).toHaveBeenCalled();

    component.endDrawing();
    expect(component['drawing']).toBeFalse();
  });

  it('should clear signature', () => {
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    component.signatureCanvas = { nativeElement: mockCanvas } as ElementRef;
    component.ionViewDidEnter();

    spyOn(component['ctx'], 'clearRect');
    component.clear();
    expect(component['ctx'].clearRect).toHaveBeenCalled();
    expect(component.frmTransaction.get('Firma')?.value).toBeNull();
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should submit form and approve subprocess', async () => {
    subprocessServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    subprocessServiceSpy.update.and.returnValue(Promise.resolve());
    taskServiceSpy.listByProcessAndSubprocess.and.returnValue(Promise.resolve([]));
    translateServiceSpy.instant.and.returnValue('Test Message');

    await component.ngOnInit();
    component.frmTransaction.patchValue({
      Kilometraje: 100,
      Nombre: 'Test Name',
      Identificacion: '123',
      Cargo: 'Test Position',
      Observaciones: 'Test Notes'
    });

    await component.submit();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(subprocessServiceSpy.update).toHaveBeenCalledWith(jasmine.objectContaining({
      StatusId: STATUS.APPROVED
    }));
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should submit form and reject subprocess', async () => {
    component.isReject = true;
    subprocessServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    subprocessServiceSpy.update.and.returnValue(Promise.resolve());
    taskServiceSpy.listByProcessAndSubprocess.and.returnValue(Promise.resolve([]));
    translateServiceSpy.instant.and.returnValue('Test Message');

    await component.ngOnInit();
    component.frmTransaction.patchValue({
      Kilometraje: 100,
      Nombre: 'Test Name',
      Identificacion: '123',
      Cargo: 'Test Position',
      Observaciones: 'Test Notes'
    });

    await component.submit();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(subprocessServiceSpy.update).toHaveBeenCalledWith(jasmine.objectContaining({
      StatusId: STATUS.REJECTED
    }));
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should handle form submission error', async () => {
    subprocessServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    subprocessServiceSpy.update.and.returnValue(Promise.reject('error'));
    taskServiceSpy.listByProcessAndSubprocess.and.returnValue(Promise.resolve([]));
    translateServiceSpy.instant.and.returnValue('Test Message');

    await component.ngOnInit();
    component.frmTransaction.patchValue({
      Kilometraje: 100,
      Nombre: 'Test Name',
      Identificacion: '123',
      Cargo: 'Test Position',
      Observaciones: 'Test Notes'
    });

    await component.submit();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  });

  it('should validate form before submission', async () => {
    subprocessServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    translateServiceSpy.instant.and.returnValue('Test Message');

    await component.ngOnInit();
    component.frmTransaction.patchValue({
      Kilometraje: -1 // Invalid value
    });

    await component.submit();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(subprocessServiceSpy.update).not.toHaveBeenCalled();
  });
});

