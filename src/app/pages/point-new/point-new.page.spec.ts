import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { PointNewPage } from './point-new.page';
import { ActivatedRoute } from '@angular/router';
import { PointsService } from '@app/services/masterdata/points.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { Punto } from '@app/interfaces/punto.interface';
import { INPUT_OUTPUT, STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

describe('PointNewPage', () => {
  let component: PointNewPage;
  let fixture: ComponentFixture<PointNewPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let pointsServiceSpy: jasmine.SpyObj<PointsService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let synchronizationServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockPuntos: Punto[] = [
    {
      IdDeposito: '1',
      IdPersona: '1',
      Nombre: 'Punto 1',
      Tipo: 'Tipo 1',
      Tercero: 'Tercero 1',
      Acopio: true,
      Almacenamiento: true,
      Disposicion: true,
      Entrega: true,
      Generacion: true,
      Recepcion: true,
      Tratamiento: true,
      IdMateriales: []
    },
    {
      IdDeposito: '2',
      IdPersona: '2',
      Nombre: 'Punto 2',
      Tipo: 'Tipo 2',
      Tercero: 'Tercero 2',
      Acopio: true,
      Almacenamiento: true,
      Disposicion: true,
      Entrega: true,
      Generacion: true,
      Recepcion: true,
      Tratamiento: true,
      IdMateriales: []
    }
  ];

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    pointsServiceSpy = jasmine.createSpyObj('PointsService', ['list']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['create']);
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
        PointNewPage
      ],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: PointsService, useValue: pointsServiceSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy },
        { provide: SynchronizationService, useValue: synchronizationServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PointNewPage);
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
    const tercero = 'Tercero 1';
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
