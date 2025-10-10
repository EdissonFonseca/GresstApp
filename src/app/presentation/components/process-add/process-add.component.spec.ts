import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessAddComponent } from './process-add.component';
import { ModalController, NavParams } from '@ionic/angular';
import { ProcessesService } from '@app/application/services/process.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { AuthorizationService } from '@app/infrastructure/repositories/authorization.repository';
import { TranslateService } from '@ngx-translate/core';
import { STATUS, SERVICE_TYPES } from '@app/core/constants';
import { Proceso } from '@app/interfaces/proceso.interface';

describe('ProcessAddComponent', () => {
  let component: ProcessAddComponent;
  let fixture: ComponentFixture<ProcessAddComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let navParamsSpy: jasmine.SpyObj<NavParams>;
  let processesServiceSpy: jasmine.SpyObj<ProcessesService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockProcess: Proceso = {
    IdProceso: '1',
    IdServicio: SERVICE_TYPES.TRANSPORT,
    IdRecurso: 'vehicle1',
    Titulo: 'Test Process',
    FechaInicial: new Date().toISOString(),
    FechaOrden: new Date().toISOString(),
    IdEstado: STATUS.PENDING,
    NavegarPorTransaccion: true,
  };

  beforeEach(async () => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    navParamsSpy = jasmine.createSpyObj('NavParams', ['get']);
    processesServiceSpy = jasmine.createSpyObj('ProcessesService', ['list', 'create']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getAccount']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    navParamsSpy.get.and.returnValue(SERVICE_TYPES.TRANSPORT);
    processesServiceSpy.list.and.returnValue(Promise.resolve([]));
    processesServiceSpy.create.and.returnValue(Promise.resolve(true));
    userNotificationServiceSpy.showLoading.and.returnValue(Promise.resolve());
    userNotificationServiceSpy.hideLoading.and.returnValue(Promise.resolve());
    translateServiceSpy.instant.and.returnValue('Test Message');

    await TestBed.configureTestingModule({
      imports: [ProcessAddComponent, ReactiveFormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavParams, useValue: navParamsSpy },
        { provide: ProcessesService, useValue: processesServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with transport service type', () => {
    expect(component.idServicio).toBe(SERVICE_TYPES.TRANSPORT);
    expect(component.showTransport).toBe(true);
  });

  it('should change service type', () => {
    component.changeService(SERVICE_TYPES.COLLECTION);
    expect(component.idServicio).toBe(SERVICE_TYPES.COLLECTION);
  });

  it('should cancel process creation', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should validate form before confirming', async () => {
    component.frmProcess.get('IdRecurso')?.setValue('');

    await component.confirm();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(processesServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should create process successfully', async () => {
    component.frmProcess.get('IdRecurso')?.setValue('test-resource');
    component.idRecurso = 'test-resource';

    await component.confirm();

    expect(processesServiceSpy.create).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
  });

  it('should handle existing transport process', async () => {
    const existingProcesses = [mockProcess];
    processesServiceSpy.list.and.returnValue(Promise.resolve(existingProcesses));

    component.frmProcess.get('IdRecurso')?.setValue('vehicle1');
    component.idRecurso = 'vehicle1';

    await component.confirm();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(processesServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should handle process creation error', async () => {
    processesServiceSpy.create.and.returnValue(Promise.reject(new Error('Creation failed')));
    component.frmProcess.get('IdRecurso')?.setValue('test-resource');

    await component.confirm();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });
});
