import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, ActionSheetController, NavController } from '@ionic/angular';
import { TransactionsPage } from './transactions.page';
import { Router } from '@angular/router';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CardService } from '@app/services/core/card.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { SessionService } from '@app/services/core/session.service';
import { Utils } from '@app/utils/utils';
import { Card } from '@app/interfaces/card.interface';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { ComponentsModule } from '@app/components/components.module';
import { Actividad } from '@app/interfaces/actividad.interface';
import { Transaccion } from '@app/interfaces/transaccion.interface';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserNotificationService } from '@app/services/core/user-notification.service';

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
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;

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

  beforeEach(async () => {
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['get']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['mapTransacciones', 'mapTransaccion', 'updateVisibleProperties']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['list', 'get']);
    syncServiceSpy = jasmine.createSpyObj('SynchronizationService', ['uploadData', 'pendingTransactions']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['synchronize']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack']);
    routerSpy = jasmine.createSpyObj('Router', ['getCurrentNavigation']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);

    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));
    transactionsServiceSpy.list.and.returnValue(Promise.resolve([mockTransaccion]));
    cardServiceSpy.mapTransacciones.and.returnValue(Promise.resolve([mockTransaction]));
    cardServiceSpy.mapTransaccion.and.returnValue(Promise.resolve(mockTransaction));
    translateServiceSpy.instant.and.returnValue('Translated text');
    syncServiceSpy.pendingTransactions.and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        ReactiveFormsModule,
        ComponentsModule,
        TranslateModule.forRoot(),
        TransactionsPage
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
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activity()).toEqual({ id: '', title: '', status: STATUS.PENDING, type: 'activity' });
    expect(component.transactions()).toEqual([]);
  });

  it('should load data on initialization', async () => {
    const nav = routerSpy.getCurrentNavigation();
    if (nav?.extras.state) {
      nav.extras.state['activity'] = mockActivity;
    }

    await component.ngOnInit();

    expect(activitiesServiceSpy.get).toHaveBeenCalled();
    expect(component.activity()).toEqual(mockActivity);
    expect(component.showAdd).toBeTrue();
    expect(component.showNavigation).toBeTrue();
    expect(component.showSupport).toBeTrue();
  });

  it('should handle initialization error', async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.reject('Error'));
    const nav = routerSpy.getCurrentNavigation();
    if (nav?.extras.state) {
      nav.extras.state['activity'] = mockActivity;
    }

    await component.ngOnInit();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should load transactions on view enter', async () => {
    await component.ionViewWillEnter();

    expect(transactionsServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapTransacciones).toHaveBeenCalled();
    expect(component.transactions()).toEqual([mockTransaction]);
  });

  it('should handle load transactions error', async () => {
    transactionsServiceSpy.list.and.returnValue(Promise.reject('Error'));

    await component.ionViewWillEnter();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should handle search input', async () => {
    const mockEvent = { target: { value: 'test' } };
    const mockTransactions = [mockTransaction];
    transactionsServiceSpy.list.and.returnValue(Promise.resolve([mockTransaccion]));
    cardServiceSpy.mapTransacciones.and.returnValue(Promise.resolve(mockTransactions));

    await component.handleInput(mockEvent);

    expect(transactionsServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapTransacciones).toHaveBeenCalled();
    expect(component.transactions()).toEqual(mockTransactions);
  });

  it('should handle search input error', async () => {
    const mockEvent = { target: { value: 'test' } };
    transactionsServiceSpy.list.and.returnValue(Promise.reject('Error'));

    await component.handleInput(mockEvent);

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should navigate to tasks', async () => {
    await component.navigateToTareas(mockTransaction);

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/tasks', {
      queryParams: { Mode: 'T', TransactionId: mockTransaction.id },
      state: { activity: component.activity() }
    });
  });

  it('should handle navigation error', async () => {
    navCtrlSpy.navigateForward.and.returnValue(Promise.reject('Error'));

    await component.navigateToTareas(mockTransaction);

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should navigate to map', async () => {
    await component.navigateToMap();

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/route', {
      queryParams: { IdActividad: component.activity().id }
    });
  });

  it('should handle map navigation error', async () => {
    navCtrlSpy.navigateForward.and.returnValue(Promise.reject('Error'));

    await component.navigateToMap();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should show support documents', async () => {
    const mockActionSheet = {
      present: jasmine.createSpy('present')
    } as any;
    actionSheetSpy.create.and.returnValue(Promise.resolve(mockActionSheet));

    await component.showSupports();

    expect(actionSheetSpy.create).toHaveBeenCalled();
    expect(mockActionSheet.present).toHaveBeenCalled();
  });

  it('should handle support documents error', async () => {
    actionSheetSpy.create.and.returnValue(Promise.reject('Error'));

    await component.showSupports();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should open add task modal', async () => {
    const mockModal = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: { IdTransaccion: '1' } }))
    } as any;
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

    await component.openAddTarea();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(mockModal.present).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(syncServiceSpy.uploadData).toHaveBeenCalled();
  });

  it('should handle add task modal error', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));

    await component.openAddTarea();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should open approve activity modal', async () => {
    const mockModal = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: true }))
    } as any;
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

    await component.openApproveActividad();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(mockModal.present).toHaveBeenCalled();
    expect(syncServiceSpy.uploadData).toHaveBeenCalled();
  });

  it('should handle approve activity modal error', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));

    await component.openApproveActividad();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should get color for synchronization status', () => {
    syncServiceSpy.pendingTransactions.and.returnValue(1);
    expect(component.getColor()).toBe('danger');

    syncServiceSpy.pendingTransactions.and.returnValue(0);
    expect(component.getColor()).toBe('success');
  });

  it('should synchronize data successfully', async () => {
    sessionServiceSpy.synchronize.and.returnValue(Promise.resolve(true));

    await component.synchronize();

    expect(sessionServiceSpy.synchronize).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should handle synchronization failure', async () => {
    sessionServiceSpy.synchronize.and.returnValue(Promise.resolve(false));

    await component.synchronize();

    expect(sessionServiceSpy.synchronize).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should handle synchronization error', async () => {
    sessionServiceSpy.synchronize.and.returnValue(Promise.reject('Error'));

    await component.synchronize();

    expect(sessionServiceSpy.synchronize).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });
});
