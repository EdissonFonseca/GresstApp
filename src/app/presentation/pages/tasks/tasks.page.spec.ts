import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { TasksPage } from './tasks.page';
import { ActivatedRoute, Router } from '@angular/router';
import { CardService } from '@app/presentation/services/card.service';
import { ProcessesService } from '@app/infrastructure/repositories/transactions/processes.repository';
import { TransactionsService } from '@app/infrastructure/repositories/transactions/transactions.repository';
import { TasksService } from '@app/infrastructure/repositories/transactions/tasks.repository';
import { SessionService } from '@app/infrastructure/services/session.service';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { STATUS } from '@app/core/constants';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { LoggerService } from '@app/infrastructure/services/logger.service';

describe('TasksPage', () => {
  let component: TasksPage;
  let fixture: ComponentFixture<TasksPage>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let processesServiceSpy: jasmine.SpyObj<ProcessesService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockCard: Card = {
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

  const mockTask: Card = {
    id: '1',
    title: 'Test Task',
    status: STATUS.PENDING,
    type: 'task',
    parentId: '1',
    pendingItems: 0,
    rejectedItems: 0,
    successItems: 0,
    quantity: 25,
    weight: 10,
    volume: 5
  };

  beforeEach(async () => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['mapTransacciones', 'mapTareas']);
    processesServiceSpy = jasmine.createSpyObj('ProcessesService', ['list', 'get']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['list', 'get']);
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['list']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['synchronize']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);
    processesServiceSpy = jasmine.createSpyObj('ProcessesService', ['get']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error']);

    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: {
        subscribe: jasmine.createSpy('subscribe').and.callFake((callback) => {
          callback({ mode: 'T', transactionId: '1', activityId: '1' });
          return { unsubscribe: () => {} };
        })
      }
    });

    processesServiceSpy.get.and.returnValue(Promise.resolve({
      IdProceso: '1',
      FechaOrden: new Date().toISOString(),
      IdRecurso: '1',
      NavegarPorTransaccion: false,
      Titulo: 'Test Activity',
      IdEstado: STATUS.PENDING,
      IdServicio: 'TRANSPORT'
    }));
    transactionsServiceSpy.get.and.returnValue(Promise.resolve({
      IdProceso: '1',
      IdTransaccion: '1',
      EntradaSalida: 'E',
      IdEstado: STATUS.PENDING,
      Punto: 'Test Point',
      Tercero: 'Test Third Party',
      IdRecurso: '1',
      IdServicio: 'TRANSPORT',
      Titulo: 'Test Transaction'
    }));
    translateServiceSpy.instant.and.returnValue('Translated text');

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        ReactiveFormsModule,
        ComponentsModule,
        TranslateModule.forRoot(),
        TasksPage
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: CardService, useValue: cardServiceSpy },
        { provide: ProcessesService, useValue: processesServiceSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activityId).toBe('');
    expect(component.transactionId).toBe('');
    expect(component.title).toBe('');
    expect(component.showAdd).toBeTrue();
    expect(component.mode).toBe('A');
  });

  it('should load data on initialization', async () => {
    await component.ngOnInit();

    expect(processesServiceSpy.get).toHaveBeenCalled();
    expect(processesServiceSpy.get).toHaveBeenCalled();
    expect(component.title).toBe('Test Activity');
    expect(component.showAdd).toBeTrue();
  });

  it('should handle initialization error', async () => {
    processesServiceSpy.get.and.returnValue(Promise.reject('Error'));

    await component.ngOnInit();

    expect(loggerServiceSpy.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should load data on view enter', async () => {
    await component.ionViewWillEnter();

    expect(processesServiceSpy.list).toHaveBeenCalled();
    expect(tasksServiceSpy.list).toHaveBeenCalled();
  });

  it('should handle search input', async () => {
    const mockEvent = { target: { value: 'test' } };

    await component.handleInput(mockEvent);

    expect(processesServiceSpy.list).toHaveBeenCalled();
    expect(tasksServiceSpy.list).toHaveBeenCalled();
  });

  it('should filter tasks by transaction ID', () => {
    const mockTasks = [mockTask];
    cardServiceSpy.mapTareas.and.returnValue(mockTasks);

    const filteredTasks = component.filterTasks('1');
    expect(filteredTasks).toEqual([mockTask]);
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
    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  });

  it('should handle add task modal error', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));

    await component.openAdd();

    expect(loggerServiceSpy.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should open edit task modal', async () => {
    const mockModal = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: { IdTransaccion: '1' } }))
    } as any;
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));

    await component.openEdit(mockTask);

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(mockModal.present).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  });

  it('should handle edit task modal error', async () => {
    modalCtrlSpy.create.and.returnValue(Promise.reject('Error'));

    await component.openEdit(mockTask);

    expect(loggerServiceSpy.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should synchronize data', async () => {
    await component.synchronize();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'top');
  });

  it('should handle synchronization error', async () => {
    tasksServiceSpy.list.and.returnValue(Promise.reject('Error'));

    await component.synchronize();

    expect(loggerServiceSpy.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should navigate back to transactions', () => {
    component.mode = 'T';
    component.activityId = '1';

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/transactions'], {
      queryParams: {
        mode: 'A',
        activityId: '1'
      }
    });
  });

  it('should navigate back to activities', () => {
    component.mode = 'A';

    component.goBack();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['/processes']);
  });
});
