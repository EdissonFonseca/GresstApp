import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ResidueTransformComponent } from './residue-transform.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { of } from 'rxjs';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';

describe('ResidueTransformComponent', () => {
  let component: ResidueTransformComponent;
  let fixture: ComponentFixture<ResidueTransformComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let navParamsSpy: jasmine.SpyObj<NavParams>;

  const mockResidue = {
    IdResiduo: '1',
    IdMaterial: '1',
    Material: 'Test Material',
    DepositoOrigen: 'Test Origin',
    FechaIngreso: '2024-01-01',
    Propietario: 'Test Owner',
    Solicitud: 'Test Request',
    Cantidad: 10,
    Peso: 100,
    Volumen: 50,
    IdEstado: STATUS.ACTIVE,
    IdDeposito: '1',
    Aprovechable: true,
    IdPropietario: '1',
    Ubicacion: 'Test Location'
  };

  beforeEach(waitForAsync(() => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getResidue']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
    navParamsSpy = jasmine.createSpyObj('NavParams', ['get']);

    inventoryServiceSpy.getResidue.and.returnValue(Promise.resolve(mockResidue));
    navParamsSpy.get.and.returnValue('1');

    TestBed.configureTestingModule({
      declarations: [ResidueTransformComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavParams, useValue: navParamsSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResidueTransformComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.residueId).toBe('1');
    expect(component.residuo).toBe('');
    expect(component.date).toBeNull();
    expect(component.idResiduo).toBe('');
    expect(component.material).toBe('');
    expect(component.idMaterial).toBe('');
    expect(component.unidad).toBe('');
    expect(component.tituloDivisor).toBe('Convertir en');
    expect(component.tituloBoton).toBe('Convertir');
    expect(component.colorConvert).toBe('primary');
    expect(component.colorDecompose).toBe('medium');
    expect(component.colorAggregate).toBe('medium');
    expect(component.serviceId).toBe('');
  });

  it('should load residue data on initialization', async () => {
    await component.ngOnInit();

    expect(inventoryServiceSpy.getResidue).toHaveBeenCalledWith('1');
    expect(component.residue).toEqual(mockResidue);
    expect(component.frm.get('Quantity')?.value).toBe(10);
  });

  it('should handle error when loading residue data', async () => {
    inventoryServiceSpy.getResidue.and.returnValue(Promise.resolve(undefined));

    await component.ngOnInit();

    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null, 'error');
  });

  it('should handle date change', () => {
    const mockDate = new Date();
    const mockEvent = { detail: { value: mockDate } };

    component.dateTimeChanged(mockEvent);

    expect(component.date).toBe(mockDate);
  });

  it('should change service to treatment', () => {
    component.changeService(SERVICE_TYPES.TREATMENT);

    expect(component.serviceId).toBe(SERVICE_TYPES.TREATMENT);
    expect(component.tituloDivisor).toBe('Convertir en');
    expect(component.tituloBoton).toBe('Convertir');
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should select material', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: { id: '1', name: 'Test Material', Unidad: 'C' } }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectMaterial();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(component.idMaterial).toBe('1');
    expect(component.material).toBe('Test Material');
    expect(component.unidad).toBe('C');
  });

  it('should handle error when selecting material', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject(new Error('Test error')));

    await component.selectMaterial();

    expect(component.idMaterial).toBe('');
    expect(component.material).toBe('');
    expect(component.unidad).toBe('');
  });

  it('should handle error when modal is dismissed without data', async () => {
    const mockModal = { present: () => Promise.resolve(), onDidDismiss: () => of({ data: null }) };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal as any));

    await component.selectMaterial();

    expect(component.idMaterial).toBe('');
    expect(component.material).toBe('');
    expect(component.unidad).toBe('');
  });
});
