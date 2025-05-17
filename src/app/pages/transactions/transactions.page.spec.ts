import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, ActionSheetController, NavController } from '@ionic/angular';
import { TransactionsPage } from './transactions.page';
import { Router } from '@angular/router';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CardService } from '@app/services/core/card.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { SessionService } from '@app/services/core/session.service';
import { Utils } from '@app/utils/utils';
import { Card } from '@app/interfaces/card';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { ComponentsModule } from '@app/components/components.module';
import { Actividad } from '@app/interfaces/actividad.interface';
import { Transaccion } from '@app/interfaces/transaccion.interface';

describe('TransactionsPage', () => {
  let component: TransactionsPage;
  let fixture: ComponentFixture<TransactionsPage>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let actionSheetSpy: jasmine.SpyObj<ActionSheetController>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockActivity: Card = {
    id: '1',
    title: 'Test Activity',
    status: STATUS.PENDING,
    type: 'activity',
    pendingItems: 2,
    rejectedItems: 1,
    successItems: 3,
    quantity: 100,
    weight: 50,
    volume: 25
  };

  const mockTransaction: Card = {
    id: '1',
    title: 'Test Transaction',
    status: STATUS.PENDING,
    type: 'transaction',
    parentId: '1',
    pendingItems: 1,
    rejectedItems: 0,
    successItems: 0,
    quantity: 50,
    weight: 25,
    volume: 10
  };

  const mockActividad: Actividad = {
    IdActividad: '1',
    FechaOrden: new Date().toISOString(),
    IdRecurso: '1',
    NavegarPorTransaccion: false,
    Titulo: 'Test Activity',
    IdEstado: STATUS.PENDING,
    IdServicio: SERVICE_TYPES.TRANSPORT
  };

  const mockTransaccion: Transaccion = {
    IdActividad: '1',
    IdTransaccion: '1',
    EntradaSalida: 'E',
    IdEstado: STATUS.PENDING,
    Punto: 'Test Point',
    Tercero: 'Test Third Party',
    IdRecurso: '1',
    IdServicio: SERVICE_TYPES.TRANSPORT,
    Titulo: 'Test Transaction'
  };

  beforeEach(waitForAsync(() => {
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['get']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['mapTransacciones', 'updateVisibleProperties']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['list', 'get']);
    syncServiceSpy = jasmine.createSpyObj('SynchronizationService', ['uploadTransactions', 'pendingTransactions']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['refresh']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    routerSpy = jasmine.createSpyObj('Router', ['getCurrentNavigation']);

    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));
    transactionsServiceSpy.list.and.returnValue(Promise.resolve([mockTransaccion]));
    cardServiceSpy.mapTransacciones.and.returnValue(Promise.resolve([mockTransaction]));
    syncServiceSpy.pendingTransactions.and.returnValue(0);

    TestBed.configureTestingModule({
      declarations: [TransactionsPage],
      imports: [
        IonicModule.forRoot(),
        ComponentsModule
      ],
      providers: [
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: CardService, useValue: cardServiceSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy },
        { provide: SynchronizationService, useValue: syncServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activity()).toEqual({ id: '', title: '', status: STATUS.PENDING, type: 'activity' });
    expect(component.transactions()).toEqual([]);
    expect(component.showAdd).toBeTrue();
    expect(component.showNavigation).toBeTrue();
    expect(component.showSupport).toBeTrue();
  });

  it('should load activity data on initialization', fakeAsync(async () => {
    routerSpy.getCurrentNavigation.and.returnValue({
      extras: {
        state: { activity: mockActivity }
      }
    } as any);

    await component.ngOnInit();
    tick();

    expect(activitiesServiceSpy.get).toHaveBeenCalledWith(mockActivity.id);
    expect(component.activity()).toEqual(mockActivity);
    expect(component.showAdd).toBeTrue();
    expect(component.showNavigation).toBeTrue();
    expect(component.showSupport).toBeTrue();
  }));

  it('should load transactions on view enter', fakeAsync(async () => {
    await component.ionViewWillEnter();
    tick();

    expect(transactionsServiceSpy.list).toHaveBeenCalledWith(component.activity().id);
    expect(cardServiceSpy.mapTransacciones).toHaveBeenCalled();
    expect(component.transactions()).toEqual([mockTransaction]);
  }));

  it('should handle search input', fakeAsync(async () => {
    const mockEvent = { target: { value: 'test' } };
    const mockTransactions = [mockTransaction];
    transactionsServiceSpy.list.and.returnValue(Promise.resolve([mockTransaccion]));
    cardServiceSpy.mapTransacciones.and.returnValue(Promise.resolve(mockTransactions));

    await component.handleInput(mockEvent);
    tick();

    expect(transactionsServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapTransacciones).toHaveBeenCalled();
    expect(component.transactions()).toEqual(mockTransactions);
  }));

  it('should navigate to tasks', () => {
    component.navigateToTareas(mockTransaction);

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/tareas', {
      queryParams: { Mode: 'T', TransactionId: mockTransaction.id },
      state: { activity: component.activity() }
    });
  });

  it('should open add task modal', fakeAsync(async () => {
    const mockModal: any = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: { IdTransaccion: '1' } }))
    };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    transactionsServiceSpy.get.and.returnValue(Promise.resolve(mockTransaccion));
    cardServiceSpy.mapTransacciones.and.returnValue(Promise.resolve([mockTransaction]));

    await component.openAddTarea();
    tick();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith({
      component: jasmine.any(Function),
      componentProps: {
        idActividad: component.activity().id
      }
    });
    expect(mockModal.present).toHaveBeenCalled();
    expect(Utils.showLoading).toHaveBeenCalledWith('Actualizando información');
    expect(Utils.hideLoading).toHaveBeenCalled();
    expect(syncServiceSpy.uploadTransactions).toHaveBeenCalled();
  }));

  it('should open approve activity modal', fakeAsync(async () => {
    const mockModal: any = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: true }))
    };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

    await component.openApproveActividad();
    tick();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith({
      component: jasmine.any(Function),
      componentProps: {
        activity: component.activity(),
        approveOrReject: 'approve'
      }
    });
    expect(mockModal.present).toHaveBeenCalled();
    expect(component.showAdd).toBeFalse();
    expect(syncServiceSpy.uploadTransactions).toHaveBeenCalled();
  }));

  it('should handle successful synchronization', fakeAsync(async () => {
    spyOn(Utils, 'showToast');
    sessionServiceSpy.refresh.and.returnValue(Promise.resolve(true));

    await component.synchronize();
    tick();

    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.showToast).toHaveBeenCalledWith('Sincronización exitosa', 'middle');
  }));

  it('should handle failed synchronization', fakeAsync(async () => {
    spyOn(Utils, 'showToast');
    sessionServiceSpy.refresh.and.returnValue(Promise.resolve(false));

    await component.synchronize();
    tick();

    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.showToast).toHaveBeenCalledWith('Sincronización fallida. Intente de nuevo mas tarde', 'middle');
  }));

  it('should return correct color based on pending transactions', () => {
    syncServiceSpy.pendingTransactions.and.returnValue(1);
    expect(component.getColor()).toBe('danger');

    syncServiceSpy.pendingTransactions.and.returnValue(0);
    expect(component.getColor()).toBe('success');
  });
});
