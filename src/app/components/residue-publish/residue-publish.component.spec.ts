import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ResiduePublishComponent } from './residue-publish.component';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { STATUS } from '@app/constants/constants';
import { Residuo } from '@app/interfaces/residuo.interface';

const mockResidue: Residuo = {
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

describe('ResiduePublishComponent', () => {
  let component: ResiduePublishComponent;
  let fixture: ComponentFixture<ResiduePublishComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getResidue']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    inventoryServiceSpy.getResidue.and.returnValue(Promise.resolve(mockResidue));

    TestBed.configureTestingModule({
      declarations: [ResiduePublishComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: NavParams, useValue: { get: () => '1' } },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResiduePublishComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.date).toBeNull();
    expect(component.residueId).toBe('');
    expect(component.residue).toBeUndefined();
  });

  it('should load residue data on initialization', async () => {
    await component.ngOnInit();

    expect(inventoryServiceSpy.getResidue).toHaveBeenCalledWith('1');
    expect(component.residue).toEqual(mockResidue);
    expect(component.formData.get('Quantity')?.value).toBe(mockResidue.Cantidad);
  });

  it('should handle error when loading residue data', async () => {
    inventoryServiceSpy.getResidue.and.returnValue(Promise.reject(new Error('Test error')));

    await component.ngOnInit();

    expect(component.residue).toBeUndefined();
  });

  it('should handle date change', () => {
    const mockDate = new Date();
    const mockEvent = { detail: { value: mockDate } };

    component.dateTimeChanged(mockEvent);

    expect(component.date).toBe(mockDate);
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should initialize form with correct controls', () => {
    expect(component.formData.get('Quantity')).toBeTruthy();
    expect(component.formData.get('TargetId')).toBeTruthy();
  });

  it('should update form values when residue is loaded', async () => {
    await component.ngOnInit();

    expect(component.formData.get('Quantity')?.value).toBe(mockResidue.Cantidad);
  });
});
