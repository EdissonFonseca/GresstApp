import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { TasksPage } from './tasks.page';
import { ActivatedRoute, Router } from '@angular/router';
import { CardService } from '@app/services/core/card.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { SessionService } from '@app/services/core/session.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { Utils } from '@app/utils/utils';
import { Card } from '@app/interfaces/card';
import { STATUS } from '@app/constants/constants';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

describe('TasksPage', () => {
  let component: TasksPage;
  let fixture: ComponentFixture<TasksPage>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let tasksServiceSpy: jasmine.SpyObj<TasksService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

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
    cardServiceSpy = jasmine.createSpyObj('CardService', ['mapTransacciones', 'mapTareas', 'mapTarea', 'updateVisibleProperties']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['list', 'get']);
    tasksServiceSpy = jasmine.createSpyObj('TasksService', ['listSugeridas']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['refresh']);
    syncServiceSpy = jasmine.createSpyObj('SynchronizationService', ['uploadData']);
    routerSpy = jasmine.createSpyObj('Router', ['getCurrentNavigation']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: {
        subscribe: jasmine.createSpy('subscribe').and.callFake((callback) => {
          callback({ Mode: 'T', TransactionId: '1' });
          return { unsubscribe: () => {} };
        })
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        ReactiveFormsModule,
        ComponentsModule,
        TasksPage
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: CardService, useValue: cardServiceSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy },
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: SynchronizationService, useValue: syncServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
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
    expect(component.activity()).toEqual({ id: '', title: '', status: STATUS.PENDING, type: 'activity' });
    expect(component.transactions()).toEqual([]);
    expect(component.tasks()).toEqual([]);
    expect(component.transactionId).toBe('1');
    expect(component.title).toBe('');
    expect(component.showAdd).toBeTrue();
    expect(component.mode).toBe('T');
  });

  it('should load data on initialization', async () => {
    const mockTransactions = [mockTransaction];
    const mockTasks = [mockTask];
    transactionsServiceSpy.list.and.returnValue(Promise.resolve([]));
    cardServiceSpy.mapTransacciones.and.returnValue(Promise.resolve(mockTransactions));
    tasksServiceSpy.listSugeridas.and.returnValue(Promise.resolve([]));
    cardServiceSpy.mapTareas.and.returnValue(mockTasks);

    await component.ionViewWillEnter();

    expect(transactionsServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapTransacciones).toHaveBeenCalled();
    expect(tasksServiceSpy.listSugeridas).toHaveBeenCalled();
    expect(cardServiceSpy.mapTareas).toHaveBeenCalled();
    expect(component.transactions()).toEqual(mockTransactions);
    expect(component.tasks()).toEqual(mockTasks);
  });

  it('should filter tasks by transaction ID', () => {
    component.tasks.set([mockTask]);
    const filteredTasks = component.filterTareas('1');
    expect(filteredTasks).toEqual([mockTask]);
  });

  it('should handle search input', async () => {
    const mockEvent = { target: { value: 'test' } };
    const mockTransactions = [mockTransaction];
    const mockTasks = [mockTask];
    transactionsServiceSpy.list.and.returnValue(Promise.resolve([]));
    cardServiceSpy.mapTransacciones.and.returnValue(Promise.resolve(mockTransactions));
    tasksServiceSpy.listSugeridas.and.returnValue(Promise.resolve([]));
    cardServiceSpy.mapTareas.and.returnValue(mockTasks);

    await component.handleInput(mockEvent);

    expect(transactionsServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapTransacciones).toHaveBeenCalled();
    expect(tasksServiceSpy.listSugeridas).toHaveBeenCalled();
    expect(cardServiceSpy.mapTareas).toHaveBeenCalled();
  });

  it('should open add task modal', async () => {
    const mockModal: any = {
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: mockTask }))
    };
    modalCtrlSpy.create.and.returnValue(Promise.resolve(mockModal));
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    cardServiceSpy.mapTarea.and.returnValue(mockTask);

    await component.openAddTarea();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith({
      component: jasmine.any(Function),
      componentProps: jasmine.any(Object)
    });
    expect(mockModal.present).toHaveBeenCalled();
    expect(Utils.showLoading).toHaveBeenCalledWith('Actualizando información');
    expect(cardServiceSpy.mapTarea).toHaveBeenCalled();
    expect(Utils.hideLoading).toHaveBeenCalled();
    expect(syncServiceSpy.uploadData).toHaveBeenCalled();
  });

  it('should handle successful synchronization', async () => {
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    spyOn(Utils, 'showToast');
    sessionServiceSpy.refresh.and.returnValue(Promise.resolve(true));
    spyOn(component, 'ionViewWillEnter');

    await component.synchronize();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.hideLoading).toHaveBeenCalled();
    expect(Utils.showToast).toHaveBeenCalledWith('Sincronización exitosa', 'top');
    expect(component.ionViewWillEnter).toHaveBeenCalled();
  });

  it('should handle failed synchronization', async () => {
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    spyOn(Utils, 'showToast');
    sessionServiceSpy.refresh.and.returnValue(Promise.resolve(false));

    await component.synchronize();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.hideLoading).toHaveBeenCalled();
    expect(Utils.showToast).toHaveBeenCalledWith(
      'No hay conexión con el servidor. Intente de nuevo más tarde',
      'top'
    );
  });

  it('should handle synchronization error', async () => {
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    spyOn(Utils, 'showToast');
    spyOn(console, 'error');
    const error = new Error('Sync failed');
    sessionServiceSpy.refresh.and.returnValue(Promise.reject(error));

    await component.synchronize();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando...');
    expect(sessionServiceSpy.refresh).toHaveBeenCalled();
    expect(Utils.hideLoading).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error durante la sincronización:', error);
    expect(Utils.showToast).toHaveBeenCalledWith(
      'Error durante la sincronización. Intente de nuevo más tarde',
      'top'
    );
  });
});
