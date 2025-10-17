import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { TasksPage } from './tasks.page';
import { ActivatedRoute, Router } from '@angular/router';
import { CardService } from '@app/presentation/services/card.service';
import { ProcessService } from '@app/application/services/process.service';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { TaskService } from '@app/application/services/task.service';
import { SessionService } from '@app/application/services/session.service';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { STATUS } from '@app/core/constants';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/presentation/components/components.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { signal } from '@angular/core';

describe('TasksPage', () => {
  let component: TasksPage;
  let fixture: ComponentFixture<TasksPage>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let processServiceSpy: jasmine.SpyObj<ProcessService>;
  let subprocessServiceSpy: jasmine.SpyObj<SubprocessService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
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
    cardServiceSpy = jasmine.createSpyObj('CardService', [
      'loadAllHierarchy',
      'getSubprocessesByProcess',
      'getTasksBySubprocess'
    ]);
    processServiceSpy = jasmine.createSpyObj('ProcessService', ['get']);
    subprocessServiceSpy = jasmine.createSpyObj('SubprocessService', ['get']);
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['list']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['synchronize']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error', 'debug', 'info']);

    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: {
        subscribe: jasmine.createSpy('subscribe').and.callFake((callback) => {
          callback({ mode: 'T', subprocessId: '1', processId: '1' });
          return { unsubscribe: () => {} };
        })
      }
    });

    processServiceSpy.get.and.returnValue(Promise.resolve({
      ProcessId: '1',
      ProcessDate: new Date().toISOString(),
      ResourceId: '1',
      Title: 'Test Activity',
      StatusId: STATUS.PENDING,
      ServiceId: 'TRANSPORT'
    }));
    subprocessServiceSpy.get.and.returnValue(Promise.resolve({
      ProcessId: '1',
      SubprocessId: '1',
      InputOutput: 'E',
      StatusId: STATUS.PENDING,
      FacilityId: '1',
      PartyName: 'Test Third Party',
      ResourceId: '1',
      ServiceId: 'TRANSPORT',
      Title: 'Test Transaction'
    }));
    translateServiceSpy.instant.and.returnValue('Translated text');

    // Setup CardService computed signals
    cardServiceSpy.loadAllHierarchy.and.returnValue(Promise.resolve());
    cardServiceSpy.getSubprocessesByProcess.and.returnValue(signal([mockTransaction]) as any);
    cardServiceSpy.getTasksBySubprocess.and.returnValue(signal([mockTask]) as any);

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
        { provide: ProcessService, useValue: processServiceSpy },
        { provide: SubprocessService, useValue: subprocessServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
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
    expect(component.activityId()).toBe('1');
    expect(component.subprocessId()).toBe('1');
    expect(component.title).toBe('');
    expect(component.showAdd).toBeTrue();
    expect(component.mode).toBe('T');
  });

  it('should load data on initialization', async () => {
    await component.ngOnInit();

    expect(processServiceSpy.get).toHaveBeenCalled();
    expect(subprocessServiceSpy.get).toHaveBeenCalled();
    expect(component.title).toBe('Test Activity');
    expect(component.showAdd).toBeTrue();
  });

  it('should handle initialization error', async () => {
    processServiceSpy.get.and.returnValue(Promise.reject('Error'));

    await component.ngOnInit();

    expect(loggerServiceSpy.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should load data on view enter', async () => {
    await component.ionViewWillEnter();

    expect(cardServiceSpy.loadAllHierarchy).toHaveBeenCalled();
  });

  it('should handle search input', async () => {
    const mockEvent = { target: { value: 'test' } };

    await component.handleInput(mockEvent);

    expect(cardServiceSpy.loadAllHierarchy).toHaveBeenCalled();
  });

  it('should get tasks for subprocess', () => {
    const tasks = component.getTasksForSubprocess('1');
    expect(tasks).toEqual([mockTask]);
    expect(cardServiceSpy.getTasksBySubprocess).toHaveBeenCalledWith('1');
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
    expect(cardServiceSpy.loadAllHierarchy).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'top');
  });

  it('should handle synchronization error', async () => {
    cardServiceSpy.loadAllHierarchy.and.returnValue(Promise.reject('Error'));

    await component.synchronize();

    expect(loggerServiceSpy.error).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
  });

  it('should navigate back to subprocesses', () => {
    component.mode = 'T';
    component.activityId.set('1');

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/subprocesses'], {
      queryParams: {
        mode: 'A',
        processId: '1'
      }
    });
  });

  it('should navigate back to processes', () => {
    component.mode = 'A';

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/processes']);
  });
});
