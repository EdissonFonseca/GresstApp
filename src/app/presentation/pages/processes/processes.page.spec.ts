import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProcessesPage } from './processes.page';
import { IonicModule, ModalController, NavController, AlertController, ActionSheetController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProcessesService } from '@app/infrastructure/repositories/transactions/processes.repository';
import { CardService } from '@app/presentation/services/card.service';
import { AuthorizationService } from '@app/infrastructure/repositories/masterdata/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { Proceso } from '@app/interfaces/proceso.interface';
import { SERVICE_TYPES, STATUS } from '@app/core/constants';

/**
 * Test suite for ProcessesPage component
 *
 * This suite tests the functionality of the processes page including:
 * - Component initialization and lifecycle
 * - Process loading, filtering, and management
 * - Navigation and routing
 * - Process creation and state management
 * - Error handling and edge cases
 * - User permissions and authorization
 */
describe('ProcessesPage', () => {
  // Component and fixture
  let component: ProcessesPage;
  let fixture: ComponentFixture<ProcessesPage>;

  // Service spies
  let processesServiceSpy: jasmine.SpyObj<ProcessesService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  // Mock data
  const mockCard: Card = {
    id: '1',
    title: 'Test Process',
    description: 'Test Description',
    status: STATUS.PENDING,
    type: 'process',
    iconName: 'test-icon',
    color: 'primary',
    successItems: 0,
    pendingItems: 1
  };

  const mockProceso: Proceso = {
    IdProceso: '1',
    Titulo: 'Test Process',
    IdEstado: STATUS.PENDING,
    IdServicio: SERVICE_TYPES.COLLECTION,
    FechaInicial: null,
    KilometrajeInicial: null,
    NavegarPorTransaccion: false,
    FechaOrden: null,
    IdRecurso: '1'
  };

  /**
   * Setup before each test
   * Initializes spies and configures test module with all required dependencies
   */
  beforeEach(async () => {
    // Initialize service spies with required methods
    processesServiceSpy = jasmine.createSpyObj('ProcessesService', [
      'list',
      'get',
      'update',
      'updateStart'
    ]);

    cardServiceSpy = jasmine.createSpyObj('CardService', [
      'mapActividades'
    ]);

    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', [
      'allowAddActivity',
      'getPermission'
    ]);

    modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast', 'showLoading', 'hideLoading']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    // Configure spy return values
    processesServiceSpy.list.and.returnValue(Promise.resolve([mockProceso]));
    processesServiceSpy.get.and.returnValue(Promise.resolve(mockProceso));
    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve([mockCard]));
    authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.resolve(true));
    translateServiceSpy.instant.and.returnValue('Translated text');

    // Configure testing module
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        ProcessesPage
      ],
      providers: [
        { provide: ProcessesService, useValue: processesServiceSpy },
        { provide: CardService, useValue: cardServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ActionSheetController, useValue: actionSheetControllerSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Component Creation Tests
   */
  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading()).toBeFalse();
    });
  });

  /**
   * Process Loading Tests
   */
  describe('Process Loading', () => {
    it('should load processes on init', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(processesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should handle error when loading processes', fakeAsync(() => {
      processesServiceSpy.list.and.returnValue(Promise.reject('Error'));

      component.ngOnInit();
      tick();

      expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
    }));

    it('should load processes on view enter', fakeAsync(() => {
      component.ionViewWillEnter();
      tick();

      expect(processesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should filter processes on input', fakeAsync(() => {
      const event = { target: { value: 'test' } };
      component.handleInput(event);
      tick();

      expect(processesServiceSpy.list).toHaveBeenCalled();
    }));
  });

  /**
   * Process Management Tests
   */
  describe('Process Management', () => {
    it('should navigate to transactions', fakeAsync(() => {
      const card = { ...mockCard, id: '1' };
      component.navigateToTransactions(card);
      tick();

      expect(navControllerSpy.navigateForward).toHaveBeenCalled();
    }));

    it('should navigate to map', fakeAsync(() => {
      component.navigateToMap();
      tick();

      expect(navControllerSpy.navigateForward).toHaveBeenCalled();
    }));

    it('should open add process modal', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: true }));
      modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

      component.openAdd(SERVICE_TYPES.COLLECTION);
      tick();

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(processesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should open approve process modal', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: true }));
      modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

      component.openApprove('1');
      tick();

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(processesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should open reject process modal', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: true }));
      modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

      component.openReject('1');
      tick();

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(processesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should synchronize processes', fakeAsync(() => {
      component.synchronize();
      tick();

      expect(userNotificationServiceSpy.showLoading).toHaveBeenCalled();
      expect(processesServiceSpy.list).toHaveBeenCalled();
      expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    }));
  });
});
