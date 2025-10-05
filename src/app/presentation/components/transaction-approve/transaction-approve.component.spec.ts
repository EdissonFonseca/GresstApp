import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { TransactionApproveComponent } from './transaction-approve.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TransactionsService } from '@app/infrastructure/repositories/transactions/transactions.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { STATUS } from '@app/core/constants';
import { Utils } from '@app/utils/utils';
import { Transaccion } from '@app/domain/entities/transaccion.entity';
import { ElementRef } from '@angular/core';

describe('TransactionApproveComponent', () => {
  let component: TransactionApproveComponent;
  let fixture: ComponentFixture<TransactionApproveComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockTransaction: Transaccion = {
    IdTransaccion: '1',
    IdActividad: '1',
    IdRecurso: '1',
    IdServicio: '1',
    IdEstado: STATUS.PENDING,
    Titulo: 'Test Transaction',
    Kilometraje: 100,
    ResponsableCargo: 'Test Position',
    ResponsableIdentificacion: '123',
    ResponsableNombre: 'Test Name',
    ResponsableObservaciones: 'Test Notes',
    approved: 5,
    pending: 3,
    rejected: 1,
    quantity: 9,
    EntradaSalida: 'INPUT'
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['get', 'update']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showLoading', 'hideLoading', 'showToast']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      declarations: [TransactionApproveComponent],
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionApproveComponent);
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

  it('should load transaction data on init', async () => {
    transactionsServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    await component.ngOnInit();
    expect(transactionsServiceSpy.get).toHaveBeenCalledWith('1', '1');
    expect(component.transaction()).toEqual(mockTransaction);
  });

  it('should initialize form with transaction data', async () => {
    transactionsServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
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

  it('should submit form and approve transaction', async () => {
    transactionsServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    transactionsServiceSpy.update.and.returnValue(Promise.resolve());
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
    expect(transactionsServiceSpy.update).toHaveBeenCalledWith(jasmine.objectContaining({
      IdEstado: STATUS.APPROVED
    }));
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should submit form and reject transaction', async () => {
    component.isReject = true;
    transactionsServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    transactionsServiceSpy.update.and.returnValue(Promise.resolve());
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
    expect(transactionsServiceSpy.update).toHaveBeenCalledWith(jasmine.objectContaining({
      IdEstado: STATUS.REJECTED
    }));
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should handle form submission error', async () => {
    transactionsServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    transactionsServiceSpy.update.and.returnValue(Promise.reject('error'));
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
    transactionsServiceSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    translateServiceSpy.instant.and.returnValue('Test Message');

    await component.ngOnInit();
    component.frmTransaction.patchValue({
      Kilometraje: -1 // Invalid value
    });

    await component.submit();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(transactionsServiceSpy.update).not.toHaveBeenCalled();
  });
});
