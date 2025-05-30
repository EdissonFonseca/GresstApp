import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, ActionSheetController, NavController } from '@ionic/angular';
import { TransactionsPage } from './transactions.page';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CardService } from '@app/services/core/card.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { SessionService } from '@app/services/core/session.service';
import { Card } from '@app/interfaces/card.interface';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { ComponentsModule } from '@app/components/components.module';
import { Actividad } from '@app/interfaces/actividad.interface';
import { Transaccion } from '@app/interfaces/transaccion.interface';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { LoggerService } from '@app/services/core/logger.service';

describe('TransactionsPage', () => {
  let component: TransactionsPage;
  let fixture: ComponentFixture<TransactionsPage>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let actionSheetSpy: jasmine.SpyObj<ActionSheetController>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockActivity: Actividad = {
    IdActividad: '1',
    FechaOrden: new Date().toISOString(),
    IdRecurso: '1',
    NavegarPorTransaccion: false,
    Titulo: 'Test Activity',
    IdEstado: STATUS.PENDING,
    IdServicio: SERVICE_TYPES.TRANSPORT
  };

  const mockTransaction: Card = {
    id: '1',
    title: 'Test Transaction',
    status: STATUS.PENDING,
    type: 'transaction',
    parentId: '1'
  };

  beforeEach(async () => {
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['get']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['mapTransacciones']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['list']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['synchronize']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack']);
    routerSpy = jasmine.createSpyObj('Router', ['getCurrentNavigation']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getAccount']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: { subscribe: jasmine.createSpy('subscribe') }
    });

    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActivity));
    transactionsServiceSpy.list.and.returnValue(Promise.resolve());
    cardServiceSpy.mapTransacciones.and.returnValue(Promise.resolve([mockTransaction]));
    translateServiceSpy.instant.and.returnValue('Translated text');

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
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
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
    expect(component.title).toBe('');
    expect(component.activityId).toBe('');
    expect(component.showAdd).toBeTrue();
    expect(component.showNavigation).toBeTrue();
    expect(component.showSupport).toBeTrue();
  });

  it('should load data on initialization', async () => {
    await component.ngOnInit();

    expect(activitiesServiceSpy.get).toHaveBeenCalled();
    expect(component.title).toBe(mockActivity.Titulo);
    expect(component.showAdd).toBeTrue();
    expect(component.showNavigation).toBeTrue();
    expect(component.showSupport).toBeTrue();
  });

  it('should handle initialization error', async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.reject('Error'));

    await component.ngOnInit();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should load transactions on view enter', async () => {
    await component.ionViewWillEnter();

    expect(transactionsServiceSpy.list).toHaveBeenCalled();
  });

  it('should handle load transactions error', async () => {
    transactionsServiceSpy.list.and.returnValue(Promise.reject('Error'));

    await component.ionViewWillEnter();

    expect(loggerServiceSpy.error).toHaveBeenCalled();
  });

  it('should handle search input', async () => {
    const mockEvent = { target: { value: 'test' } };

    await component.handleInput(mockEvent);

    expect(transactionsServiceSpy.list).toHaveBeenCalled();
  });

  it('should navigate to tasks', async () => {
    await component.navigateToTasks(mockTransaction);

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/tasks', {
      queryParams: { mode: 'T', transactionId: mockTransaction.id, activityId: component.activityId }
    });
  });

  it('should handle navigation error', async () => {
    navCtrlSpy.navigateForward.and.returnValue(Promise.reject('Error'));

    await component.navigateToTasks(mockTransaction);

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should navigate to map', async () => {
    await component.navigateToMap();

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/route', {
      queryParams: { IdActividad: component.activityId }
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
    authorizationServiceSpy.getAccount.and.returnValue(Promise.resolve({ IdPersonaCuenta: '1' }));

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

    await component.openAdd();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(mockModal.present).toHaveBeenCalled();
  });

  it('should handle add task modal error', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));

    await component.openAdd();

    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });
});
