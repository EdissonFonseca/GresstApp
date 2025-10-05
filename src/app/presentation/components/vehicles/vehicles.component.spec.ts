import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { VehiclesComponent } from './vehicles.component';
import { VehiclesService } from '@app/infrastructure/repositories/masterdata/vehicles.repository';
import { ActivatedRoute } from '@angular/router';
import { Vehiculo } from '@app/domain/entities/vehiculo.entity';

describe('VehiclesComponent', () => {
  let component: VehiclesComponent;
  let fixture: ComponentFixture<VehiclesComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let vehiclesServiceSpy: jasmine.SpyObj<VehiclesService>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockVehicles: Vehiculo[] = [
    {
      IdVehiculo: '1',
      Nombre: 'Test Vehicle 1',
      IdMateriales: ['1']
    },
    {
      IdVehiculo: '2',
      Nombre: 'Test Vehicle 2',
      IdMateriales: ['2']
    }
  ];

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    vehiclesServiceSpy = jasmine.createSpyObj('VehiclesService', ['list']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: { subscribe: jasmine.createSpy('subscribe') }
    });

    TestBed.configureTestingModule({
      declarations: [VehiclesComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: VehiclesService, useValue: vehiclesServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showHeader).toBeTrue();
    expect(component.vehicles).toEqual([]);
    expect(component.selectedValue).toBe('');
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
  });

  it('should load vehicles on init', async () => {
    vehiclesServiceSpy.list.and.returnValue(Promise.resolve(mockVehicles));
    await component.ngOnInit();
    expect(vehiclesServiceSpy.list).toHaveBeenCalled();
    expect(component.vehicles).toEqual(mockVehicles);
  });

  it('should handle search input by name', async () => {
    vehiclesServiceSpy.list.and.returnValue(Promise.resolve(mockVehicles));
    await component.ngOnInit();

    const mockEvent = {
      target: {
        value: 'Test Vehicle 1'
      }
    };

    await component.handleInput(mockEvent);
    expect(component.selectedName).toBe('Test Vehicle 1');
    expect(component.searchText).toBe('Test Vehicle 1');
    expect(component.vehicles.length).toBe(1);
    expect(component.vehicles[0].Nombre).toBe('Test Vehicle 1');
  });

  it('should handle search input by ID when name is not available', async () => {
    const vehiclesWithoutName = [
      {
        IdVehiculo: '1',
        Nombre: '',
        IdMateriales: ['1']
      }
    ];
    vehiclesServiceSpy.list.and.returnValue(Promise.resolve(vehiclesWithoutName));
    await component.ngOnInit();

    const mockEvent = {
      target: {
        value: '1'
      }
    };

    await component.handleInput(mockEvent);
    expect(component.vehicles.length).toBe(1);
    expect(component.vehicles[0].IdVehiculo).toBe('1');
  });

  it('should handle empty search input', async () => {
    vehiclesServiceSpy.list.and.returnValue(Promise.resolve(mockVehicles));
    await component.ngOnInit();

    const mockEvent = {
      target: {
        value: ''
      }
    };

    await component.handleInput(mockEvent);
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
    expect(component.vehicles).toEqual(mockVehicles);
  });

  it('should handle case-insensitive search', async () => {
    vehiclesServiceSpy.list.and.returnValue(Promise.resolve(mockVehicles));
    await component.ngOnInit();

    const mockEvent = {
      target: {
        value: 'test vehicle 1'
      }
    };

    await component.handleInput(mockEvent);
    expect(component.vehicles.length).toBe(1);
    expect(component.vehicles[0].Nombre).toBe('Test Vehicle 1');
  });

  it('should select vehicle and dismiss modal', () => {
    const idVehicle = '1';
    component.select(idVehicle);
    expect(component.selectedValue).toBe(idVehicle);
    expect(component.selectedName).toBe(idVehicle);
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      id: idVehicle,
      name: idVehicle
    });
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should handle error when loading vehicles', async () => {
    const error = new Error('Failed to load vehicles');
    vehiclesServiceSpy.list.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    await component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Error loading vehicles:', error);
  });

  it('should handle error when searching vehicles', async () => {
    const error = new Error('Failed to search vehicles');
    vehiclesServiceSpy.list.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    const mockEvent = {
      target: {
        value: 'Test'
      }
    };

    await component.handleInput(mockEvent);
    expect(console.error).toHaveBeenCalledWith('Error searching vehicles:', error);
  });
});
