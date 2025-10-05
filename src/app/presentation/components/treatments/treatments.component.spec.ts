import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { TreatmentsComponent } from './treatments.component';
import { TreatmentsService } from '@app/infrastructure/repositories/masterdata/treatments.repository';
import { ActivatedRoute } from '@angular/router';
import { Tratamiento } from '@app/domain/entities/tratamiento.entity';

describe('TreatmentsComponent', () => {
  let component: TreatmentsComponent;
  let fixture: ComponentFixture<TreatmentsComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let treatmentsServiceSpy: jasmine.SpyObj<TreatmentsService>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;

  const mockTreatments: Tratamiento[] = [
    {
      IdTratamiento: '1',
      Nombre: 'Test Treatment 1',
      Descripcion: 'Description 1',
      IdServicio: '1'
    },
    {
      IdTratamiento: '2',
      Nombre: 'Test Treatment 2',
      Descripcion: 'Description 2',
      IdServicio: '2'
    }
  ];

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    treatmentsServiceSpy = jasmine.createSpyObj('TreatmentsService', ['list']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: { subscribe: jasmine.createSpy('subscribe') }
    });
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);

    TestBed.configureTestingModule({
      declarations: [TreatmentsComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: TreatmentsService, useValue: treatmentsServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: ToastController, useValue: toastCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showHeader).toBeTrue();
    expect(component.treatments).toEqual([]);
    expect(component.selectedValue).toBe('');
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
  });

  it('should load treatments on init', async () => {
    treatmentsServiceSpy.list.and.returnValue(Promise.resolve(mockTreatments));
    await component.ngOnInit();
    expect(treatmentsServiceSpy.list).toHaveBeenCalled();
    expect(component.treatments).toEqual(mockTreatments);
  });

  it('should handle search input', async () => {
    treatmentsServiceSpy.list.and.returnValue(Promise.resolve(mockTreatments));
    await component.ngOnInit();

    const mockEvent = {
      target: {
        value: 'Test Treatment 1'
      }
    };

    await component.handleInput(mockEvent);
    expect(component.selectedName).toBe('Test Treatment 1');
    expect(component.searchText).toBe('Test Treatment 1');
    expect(component.treatments.length).toBe(1);
    expect(component.treatments[0].Nombre).toBe('Test Treatment 1');
  });

  it('should handle empty search input', async () => {
    treatmentsServiceSpy.list.and.returnValue(Promise.resolve(mockTreatments));
    await component.ngOnInit();

    const mockEvent = {
      target: {
        value: ''
      }
    };

    await component.handleInput(mockEvent);
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
    expect(component.treatments).toEqual(mockTreatments);
  });

  it('should handle case-insensitive search', async () => {
    treatmentsServiceSpy.list.and.returnValue(Promise.resolve(mockTreatments));
    await component.ngOnInit();

    const mockEvent = {
      target: {
        value: 'test treatment 1'
      }
    };

    await component.handleInput(mockEvent);
    expect(component.treatments.length).toBe(1);
    expect(component.treatments[0].Nombre).toBe('Test Treatment 1');
  });

  it('should select treatment and dismiss modal', () => {
    const idTreatment = '1';
    const name = 'Test Treatment 1';
    component.select(idTreatment, name);
    expect(component.selectedValue).toBe(idTreatment);
    expect(component.selectedName).toBe(name);
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      id: idTreatment,
      name: name
    });
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should handle error when loading treatments', async () => {
    const error = new Error('Failed to load treatments');
    treatmentsServiceSpy.list.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    await component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Error loading treatments:', error);
  });

  it('should handle error when searching treatments', async () => {
    const error = new Error('Failed to search treatments');
    treatmentsServiceSpy.list.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    const mockEvent = {
      target: {
        value: 'Test'
      }
    };

    await component.handleInput(mockEvent);
    expect(console.error).toHaveBeenCalledWith('Error searching treatments:', error);
  });
});
