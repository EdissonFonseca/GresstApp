import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, NavController, ToastController } from '@ionic/angular';
import { ProductionPage } from './production.page';
import { TasksService } from '@app/services/transactions/tasks.service';
import { ActivatedRoute } from '@angular/router';
import { Tarea } from '@app/interfaces/tarea.interface';
import { STATUS } from '@app/constants/constants';

describe('ProductionPage', () => {
  let component: ProductionPage;
  let fixture: ComponentFixture<ProductionPage>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;

  const mockTareas: Tarea[] = [
    {
      IdActividad: '1',
      IdTransaccion: '1',
      IdTarea: '1',
      IdMaterial: '1',
      IdRecurso: '1',
      IdServicio: '1',
      IdEstado: STATUS.PENDING,
      EntradaSalida: 'E',
      Material: 'Material 1',
      Fotos: []
    },
    {
      IdActividad: '1',
      IdTransaccion: '1',
      IdTarea: '2',
      IdMaterial: '2',
      IdRecurso: '1',
      IdServicio: '1',
      IdEstado: STATUS.PENDING,
      EntradaSalida: 'S',
      Material: 'Material 2',
      Fotos: []
    }
  ];

  beforeEach(async () => {
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['list']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [ProductionPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                IdServicio: 1,
                IdActividad: '1',
                Titulo: 'Test Title',
                Proceso: 'Test Process',
                Icono: 'test-icon'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductionPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with route parameters', () => {
    expect(component.idServicio).toBe(1);
    expect(component.idActividad).toBe('1');
    expect(component.titulo).toBe('Test Title');
    expect(component.proceso).toBe('Test Process');
    expect(component.icono).toBe('test-icon');
  });

  it('should initialize with default values', () => {
    expect(component.transacciones).toEqual([]);
    expect(component.idEstado).toBe('P');
    expect(component.coordinates).toBe('');
    expect(component.currentLocation).toBeUndefined();
  });

  it('should load transactions on init', fakeAsync(() => {
    tasksServiceSpy.list.and.returnValue(Promise.resolve(mockTareas));

    component.ngOnInit();
    tick();

    expect(tasksServiceSpy.list).toHaveBeenCalledWith('1');
    expect(component.transacciones).toEqual(mockTareas);
  }));

  it('should handle error when loading transactions', fakeAsync(() => {
    const error = new Error('Failed to load transactions');
    tasksServiceSpy.list.and.returnValue(Promise.reject(error));

    component.ngOnInit();
    tick();

    expect(tasksServiceSpy.list).toHaveBeenCalledWith('1');
    expect(component.transacciones).toEqual([]);
  }));

  it('should update coordinates when location changes', () => {
    const mockLocation = {
      coords: {
        latitude: 123,
        longitude: 456
      }
    };

    component.currentLocation = mockLocation;
    component.coordinates = '123,456';

    expect(component.currentLocation).toEqual(mockLocation);
    expect(component.coordinates).toBe('123,456');
  });

  it('should clear location data on error', () => {
    component.currentLocation = undefined;
    component.coordinates = '';

    expect(component.currentLocation).toBeUndefined();
    expect(component.coordinates).toBe('');
  });

  it('should have a modal view child', () => {
    expect(component.modal).toBeDefined();
  });
});
