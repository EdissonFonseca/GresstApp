import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ResiduesComponent } from './residues.component';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { STATUS } from '@app/constants/constants';
import { Residuo } from '@app/interfaces/residuo.interface';

describe('ResiduesComponent', () => {
  let component: ResiduesComponent;
  let fixture: ComponentFixture<ResiduesComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockResidues: Residuo[] = [
    {
      IdResiduo: '1',
      IdMaterial: '1',
      Material: 'Test Material 1',
      DepositoOrigen: 'Test Origin 1',
      FechaIngreso: '2024-01-01',
      Propietario: 'Test Owner 1',
      Solicitud: 'Test Request 1',
      Cantidad: 10,
      Peso: 100,
      Volumen: 50,
      IdEstado: STATUS.ACTIVE,
      IdDeposito: '1',
      Aprovechable: true,
      IdPropietario: '1',
      Ubicacion: 'Test Location 1'
    },
    {
      IdResiduo: '2',
      IdMaterial: '2',
      Material: 'Test Material 2',
      DepositoOrigen: 'Test Origin 2',
      FechaIngreso: '2024-01-02',
      Propietario: 'Test Owner 2',
      Solicitud: 'Test Request 2',
      Cantidad: 20,
      Peso: 200,
      Volumen: 100,
      IdEstado: STATUS.ACTIVE,
      IdDeposito: '2',
      Aprovechable: true,
      IdPropietario: '2',
      Ubicacion: 'Test Location 2'
    }
  ];

  beforeEach(waitForAsync(() => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['list']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: of({})
    });

    inventoryServiceSpy.list.and.returnValue(Promise.resolve(mockResidues));

    TestBed.configureTestingModule({
      declarations: [ResiduesComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResiduesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showHeader).toBeTrue();
    expect(component.residues).toEqual([]);
    expect(component.selectedValue).toBe('');
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
  });

  it('should load residues on initialization', async () => {
    await component.ngOnInit();

    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residues).toEqual(mockResidues);
  });

  it('should handle search input', async () => {
    const searchEvent = {
      target: {
        value: 'Test Material 1'
      }
    };

    await component.handleInput(searchEvent);

    expect(component.selectedName).toBe('Test Material 1');
    expect(component.searchText).toBe('Test Material 1');
    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residues.length).toBe(1);
    expect(component.residues[0].Material).toBe('Test Material 1');
  });

  it('should handle empty search input', async () => {
    const searchEvent = {
      target: {
        value: ''
      }
    };

    await component.handleInput(searchEvent);

    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
    expect(inventoryServiceSpy.list).toHaveBeenCalled();
    expect(component.residues).toEqual(mockResidues);
  });

  it('should select residue and dismiss modal', async () => {
    const idMaterial = '1';
    const nombre = 'Test Material 1';

    await component.select(idMaterial, nombre);

    expect(component.selectedValue).toBe(idMaterial);
    expect(component.selectedName).toBe(nombre);
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      id: idMaterial,
      name: nombre
    });
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should handle error when loading residues', async () => {
    inventoryServiceSpy.list.and.returnValue(Promise.reject(new Error('Test error')));

    await component.ngOnInit();

    expect(component.residues).toEqual([]);
  });
});
