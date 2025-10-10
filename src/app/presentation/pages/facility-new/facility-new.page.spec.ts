import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { FacilityNewPage } from './facility-new.page';
import { ActivatedRoute } from '@angular/router';
import { PointsService } from '@app/infrastructure/repositories/facility.repository';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { SynchronizationService } from '@app/infrastructure/services/synchronization.service';
import { Punto } from '@app/domain/entities/punto.entity';
import { INPUT_OUTPUT, STATUS, SERVICE_TYPES } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/presentation/components/components.module';

describe('FacilityNewPage', () => {
  let component: FacilityNewPage;
  let fixture: ComponentFixture<FacilityNewPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let pointsServiceSpy: jasmine.SpyObj<PointsService>;
  let transactionsServiceSpy: jasmine.SpyObj<SubprocessService>;
  let synchronizationServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockPuntos: Punto[] = [
    {
      IdDeposito: '1',
      IdPersona: '1',
      Nombre: 'Punto 1',
      Tipo: 'Tipo 1',
      Acopio: true,
      Almacenamiento: true,
      Disposicion: true,
      Entrega: true,
      Generacion: true,
      Recepcion: true,
      Tratamiento: true,
    //  IdMateriales: []
    },
    {
      IdDeposito: '2',
      IdPersona: '2',
      Nombre: 'Punto 2',
      Tipo: 'Tipo 2',
      Acopio: true,
      Almacenamiento: true,
      Disposicion: true,
      Entrega: true,
      Generacion: true,
      Recepcion: true,
      Tratamiento: true,
    //    IdMateriales: []
    }
  ];

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    pointsServiceSpy = jasmine.createSpyObj('PointsService', ['list']);
    transactionsServiceSpy = jasmine.createSpyObj('SubprocessesService', ['create']);
    synchronizationServiceSpy = jasmine.createSpyObj('SynchronizationService', ['uploadData']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: {
        subscribe: jasmine.createSpy('subscribe').and.callFake((callback) => {
          callback({ IdActividad: '123' });
          return { unsubscribe: () => {} };
        })
      }
    });

    pointsServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));
    transactionsServiceSpy.create.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        FacilityNewPage
      ],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: PointsService, useValue: pointsServiceSpy },
        { provide: SubprocessService, useValue: transactionsServiceSpy },
        { provide: SynchronizationService, useValue: synchronizationServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FacilityNewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with activity ID from route params', () => {
    expect(component.idActividad).toBe('123');
  });

  it('should load points on initialization', async () => {
    await component.ngOnInit();
    expect(pointsServiceSpy.list).toHaveBeenCalled();
    expect(component.puntos).toEqual(mockPuntos);
  });

  it('should filter points based on search input', async () => {
    const searchEvent = {
      target: {
        value: 'Punto 1'
      }
    };
    await component.handleInput(searchEvent);
    expect(component.puntos.length).toBe(1);
    expect(component.puntos[0].Nombre).toBe('Punto 1');
  });

  it('should select a point', () => {
    const idPunto = '1';
    const tercero = 'IdPersona 1';
    const nombre = 'Punto 1';
    component.select(idPunto, tercero, nombre);
    expect(component.idPunto).toBe(idPunto);
    expect(component.punto).toBe(`${tercero} - ${nombre}`);
  });

  it('should create transaction and navigate on confirm', async () => {
    spyOn(Utils, 'generateId').and.returnValue('test-id');
    component.idActividad = '123';
    component.idPunto = '1';
    await component.confirm();

    expect(transactionsServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      IdActividad: '123',
      IdTransaccion: 'test-id',
      EntradaSalida: INPUT_OUTPUT.INPUT,
      IdServicio: SERVICE_TYPES.COLLECTION,
      IdEstado: STATUS.PENDING
    }));
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/route', {
      queryParams: { IdActividad: '123' }
    });
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
    expect(title.textContent).toContain('Agregar Punto');
  });

  it('should render search bar', () => {
    const compiled = fixture.nativeElement;
    const searchBar = compiled.querySelector('ion-searchbar');
    expect(searchBar).toBeTruthy();
  });

  it('should render points list', () => {
    const compiled = fixture.nativeElement;
    const list = compiled.querySelector('ion-list');
    expect(list).toBeTruthy();
  });

  it('should render confirm button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button[strong="true"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Confirmar');
  });
});

