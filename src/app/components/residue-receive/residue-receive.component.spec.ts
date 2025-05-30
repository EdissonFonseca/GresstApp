import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ResidueReceiveComponent } from './residue-receive.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { of } from 'rxjs';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';

describe('ResidueReceiveComponent', () => {
  let component: ResidueReceiveComponent;
  let fixture: ComponentFixture<ResidueReceiveComponent>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;

  beforeEach(waitForAsync(() => {
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['create']);
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['create']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['create']);
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['createResidue']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['allowService', 'getPersonId']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);

    activitiesServiceSpy.create.and.returnValue(Promise.resolve(true));
    tasksServiceSpy.create.and.returnValue(Promise.resolve(true));
    transactionsServiceSpy.create.and.returnValue(Promise.resolve());
    inventoryServiceSpy.createResidue.and.returnValue(Promise.resolve(true));
    authorizationServiceSpy.allowService.and.returnValue(Promise.resolve(true));
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('1'));

    TestBed.configureTestingModule({
      declarations: [ResidueReceiveComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResidueReceiveComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.fecha).toBeNull();
    expect(component.idEmbalaje).toBe('');
    expect(component.idPropietario).toBe('');
    expect(component.idPuntoRecepcion).toBe('');
    expect(component.idPuntoRecoleccion).toBe('');
    expect(component.idMaterial).toBe('');
    expect(component.idVehiculo).toBe('');
    expect(component.embalaje).toBe('');
    expect(component.propietario).toBe('');
    expect(component.puntoRecepcion).toBe('');
    expect(component.puntoRecoleccion).toBe('');
    expect(component.material).toBe('');
    expect(component.medicion).toBe('');
    expect(component.vehiculo).toBe('');
    expect(component.serviceId).toBe('');
    expect(component.showDetails).toBeFalse();
  });

  it('should check service permissions on initialization', async () => {
    await component.ngOnInit();

    expect(authorizationServiceSpy.allowService).toHaveBeenCalledWith(SERVICE_TYPES.TRANSPORT);
    expect(authorizationServiceSpy.allowService).toHaveBeenCalledWith(SERVICE_TYPES.RELOCATION);
    expect(authorizationServiceSpy.allowService).toHaveBeenCalledWith(SERVICE_TYPES.GENERATION);
    expect(authorizationServiceSpy.allowService).toHaveBeenCalledWith(SERVICE_TYPES.RECEPTION);
  });

  it('should handle date change', () => {
    const mockDate = new Date();
    const mockEvent = { detail: { value: mockDate } };

    component.dateTimeChanged(mockEvent);

    expect(component.fecha).toBe(mockDate);
  });

  it('should change service', () => {
    component.changeService('test');
    expect(component.serviceId).toBe('test');
  });

  it('should toggle show details', () => {
    expect(component.showDetails).toBeFalse();
    component.toggleShowDetails();
    expect(component.showDetails).toBeTrue();
    component.toggleShowDetails();
    expect(component.showDetails).toBeFalse();
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should select material', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Material', unit: 'C' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectMaterial();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idMaterial).toBe('1');
    expect(component.material).toBe('Test Material');
    expect(component.medicion).toBe('C');
  });

  it('should select punto recepcion', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Point' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectPuntoRecepcion();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idPuntoRecepcion).toBe('1');
    expect(component.puntoRecepcion).toBe('Test Point');
  });

  it('should select punto recoleccion', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Point', owner: '2' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectPuntoRecoleccion();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idPuntoRecoleccion).toBe('1');
    expect(component.puntoRecoleccion).toBe('Test Point');
    expect(component.idPropietario).toBe('2');
  });

  it('should select propietario', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Owner' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectPropietario();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idPropietario).toBe('1');
    expect(component.propietario).toBe('Test Owner');
  });

  it('should select vehiculo', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Vehicle' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectVehiculo();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idVehiculo).toBe('1');
    expect(component.vehiculo).toBe('Test Vehicle');
  });

  it('should select embalaje', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Package' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectEmbalaje();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idEmbalaje).toBe('1');
    expect(component.embalaje).toBe('Test Package');
  });

  it('should handle error when selecting material', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectMaterial();

    expect(component.idMaterial).toBe('');
    expect(component.material).toBe('');
    expect(component.medicion).toBe('');
  });

  it('should handle error when selecting punto recepcion', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectPuntoRecepcion();

    expect(component.idPuntoRecepcion).toBe('');
    expect(component.puntoRecepcion).toBe('');
  });

  it('should handle error when selecting punto recoleccion', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectPuntoRecoleccion();

    expect(component.idPuntoRecoleccion).toBe('');
    expect(component.puntoRecoleccion).toBe('');
    expect(component.idPropietario).toBe('');
  });

  it('should handle error when selecting propietario', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectPropietario();

    expect(component.idPropietario).toBe('');
    expect(component.propietario).toBe('');
  });

  it('should handle error when selecting vehiculo', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectVehiculo();

    expect(component.idVehiculo).toBe('');
    expect(component.vehiculo).toBe('');
  });

  it('should handle error when selecting embalaje', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectEmbalaje();

    expect(component.idEmbalaje).toBe('');
    expect(component.embalaje).toBe('');
  });
});
