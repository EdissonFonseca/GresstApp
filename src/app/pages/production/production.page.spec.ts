import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, IonModal } from '@ionic/angular';
import { ProductionPage } from './production.page';
import { ActivatedRoute } from '@angular/router';
import { Tarea } from '@app/interfaces/tarea.interface';
import { STATUS } from '@app/constants/constants';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

describe('ProductionPage', () => {
  let component: ProductionPage;
  let fixture: ComponentFixture<ProductionPage>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

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
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParams: {
          IdServicio: 1,
          IdActividad: '1',
          Titulo: 'Test Title',
          Proceso: 'Test Process',
          Icono: 'test-icon'
        }
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        ProductionPage
      ],
      providers: [
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should render header with back button', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('ion-header');
    expect(header).toBeTruthy();
    const backButton = header.querySelector('ion-back-button');
    expect(backButton).toBeTruthy();
  });

  it('should render header with title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Test Title');
  });

  it('should render process information', () => {
    const compiled = fixture.nativeElement;
    const processInfo = compiled.querySelector('.process-info');
    expect(processInfo).toBeTruthy();
    expect(processInfo.textContent).toContain('Test Process');
  });

  it('should render transactions list', () => {
    const compiled = fixture.nativeElement;
    const list = compiled.querySelector('ion-list');
    expect(list).toBeTruthy();
  });

  it('should render modal', () => {
    const compiled = fixture.nativeElement;
    const modal = compiled.querySelector('ion-modal');
    expect(modal).toBeTruthy();
  });
});
