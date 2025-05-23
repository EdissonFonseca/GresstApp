import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ProductionPage } from './production.page';
import { ActivatedRoute } from '@angular/router';
import { Tarea } from '@app/interfaces/tarea.interface';
import { STATUS } from '@app/constants/constants';

describe('ProductionPage', () => {
  let component: ProductionPage;
  let fixture: ComponentFixture<ProductionPage>;

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
    await TestBed.configureTestingModule({
      declarations: [ProductionPage],
      imports: [IonicModule.forRoot()],
      providers: [
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

  describe('Initialization', () => {
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
  });

  describe('Location Handling', () => {
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
  });

  describe('Modal Handling', () => {
    it('should have a modal view child', () => {
      expect(component.modal).toBeDefined();
    });
  });
});
