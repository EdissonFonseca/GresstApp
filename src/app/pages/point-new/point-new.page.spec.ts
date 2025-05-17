import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { PointNewPage } from './point-new.page';
import { ActivatedRoute } from '@angular/router';
import { PointsService } from '@app/services/masterdata/points.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { Punto } from 'src/app/interfaces/punto.interface';
import { INPUT_OUTPUT, STATUS, SERVICE_TYPES } from '@app/constants/constants';

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
    synchronizationServiceSpy = jasmine.createSpyObj('SynchronizationService', ['uploadTransactions']);
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
      declarations: [PointNewPage],
      imports: [IonicModule.forRoot()],
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

  it('should load points on initialization', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(pointsServiceSpy.list).toHaveBeenCalled();
    expect(component.puntos).toEqual(mockPuntos);
  }));

  it('should filter points based on search input', fakeAsync(async () => {
    const searchEvent = {
      target: {
        value: 'Punto 1'
      }
    };
    await component.handleInput(searchEvent);
    tick();
    expect(component.puntos.length).toBe(1);
    expect(component.puntos[0].Nombre).toBe('Punto 1');
  }));

  it('should select a point', () => {
    const idPunto = '1';
    const tercero = 'Tercero 1';
    const nombre = 'Punto 1';
    component.select(idPunto, tercero, nombre);
    expect(component.idPunto).toBe(idPunto);
    expect(component.punto).toBe(`${tercero} - ${nombre}`);
  });

  it('should create transaction and navigate on confirm', fakeAsync(async () => {
    component.idActividad = '123';
    component.idPunto = '1';
    await component.confirm();
    tick();

    expect(transactionsServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      IdActividad: '123',
      EntradaSalida: INPUT_OUTPUT.INPUT,
      IdServicio: SERVICE_TYPES.COLLECTION,
      IdEstado: STATUS.PENDING
    }));
    expect(synchronizationServiceSpy.uploadTransactions).toHaveBeenCalled();
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/route', {
      queryParams: { IdActividad: '123' }
    });
  }));
});
