import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivitiesPage } from './activities.page';
import { IonicModule, ModalController, NavController, AlertController, ActionSheetController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CardService } from '@app/services/core/card.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { Utils } from '@app/utils/utils';
import { of, throwError } from 'rxjs';
import { Card } from '@app/interfaces/card.interface';
import { Actividad } from '@app/interfaces/actividad.interface';
import { SERVICE_TYPES, STATUS } from '@app/constants/constants';
import { signal, WritableSignal } from '@angular/core';

/**
 * Test suite for ActivitiesPage component
 *
 * This suite tests the functionality of the activities page including:
 * - Component initialization and lifecycle
 * - Activity loading, filtering, and management
 * - Navigation and routing
 * - Activity creation and state management
 * - Error handling and edge cases
 * - User permissions and authorization
 */
describe('ActivitiesPage', () => {
  // Component and fixture
  let component: ActivitiesPage;
  let fixture: ComponentFixture<ActivitiesPage>;

  // Service spies
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let synchronizationServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  // Mock data
  const mockCard: Card = {
    id: '1',
    title: 'Test Activity',
    description: 'Test Description',
    status: 'active',
    type: 'activity',
    iconName: 'test-icon',
    color: 'primary',
    successItems: 0,
    pendingItems: 1
  };

  const mockActividad: Actividad = {
    IdActividad: '1',
    Titulo: 'Test Activity',
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
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', [
      'list',
      'get',
      'updateStart',
      'load',
      'create',
      'update'
    ]);

    cardServiceSpy = jasmine.createSpyObj('CardService', [
      'mapActividades',
      'mapActividad'
    ]);

    synchronizationServiceSpy = jasmine.createSpyObj('SynchronizationService', [
      'uploadData'
    ]);

    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', [
      'allowAddActivity',
      'getPermission'
    ]);

    modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

    // Configure spy return values
    activitiesServiceSpy.list.and.returnValue(Promise.resolve([mockActividad]));
    activitiesServiceSpy.load.and.returnValue(Promise.resolve());
    activitiesServiceSpy.updateStart.and.returnValue(Promise.resolve(true));
    activitiesServiceSpy.create.and.returnValue(Promise.resolve(true));
    activitiesServiceSpy.update.and.returnValue(Promise.resolve(true));

    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve([mockCard]));
    cardServiceSpy.mapActividad.and.returnValue(Promise.resolve(mockCard));

    authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.resolve(true));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve('permission'));

    // Setup activities signal
    const activitiesSignal = signal<Actividad[]>([mockActividad]);
    Object.defineProperty(activitiesServiceSpy, 'activities', {
      get: () => activitiesSignal
    });

    // Configure testing module
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        ReactiveFormsModule,
        ActivitiesPage
      ],
      providers: [
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: CardService, useValue: cardServiceSpy },
        { provide: SynchronizationService, useValue: synchronizationServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ActionSheetController, useValue: actionSheetControllerSpy },
        { provide: NavController, useValue: navControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesPage);
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

    it('should initialize with default values', async () => {
      expect(component.showAdd).toBeTrue();
      const activities = await component.activities();
      expect(activities).toEqual([mockCard]);
    });
  });

  /**
   * Activity Loading Tests
   */
  describe('Activity Loading', () => {
    it('should load activities and check permissions on init', async () => {
      await component.ionViewWillEnter();
      expect(activitiesServiceSpy.load).toHaveBeenCalled();
      expect(cardServiceSpy.mapActividades).toHaveBeenCalledWith([mockActividad]);
      const activities = await component.activities();
      expect(activities).toEqual([mockCard]);
    });

    it('should handle error when loading activities', async () => {
      activitiesServiceSpy.load.and.returnValue(Promise.reject('Error'));
      const showToastSpy = spyOn(Utils, 'showToast' as any);
      await component.ionViewWillEnter();
      expect(showToastSpy).toHaveBeenCalledWith('Error al cargar las actividades', 'top');
    });

    it('should filter activities on input', async () => {
      const event = { target: { value: 'test' } };
      await component.handleInput(event);
      expect(activitiesServiceSpy.load).toHaveBeenCalled();
      expect(cardServiceSpy.mapActividades).toHaveBeenCalled();
    });
  });

  /**
   * Activity Management Tests
   */
  describe('Activity Management', () => {
    it('should handle mileage prompt', async () => {
      const alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));
      alertSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { mileage: '100' } }));

      const result = await component.requestMileagePrompt();
      expect(result).toBeTrue();
    });

    it('should initialize activity start', async () => {
      const mockDate = new Date();
      mockActividad.FechaInicial = null;
      await component['initializeActivityStart'](mockActividad);
      expect(activitiesServiceSpy.updateStart).toHaveBeenCalledWith(mockActividad);
    });

    it('should handle error when initializing activity start', async () => {
      activitiesServiceSpy.updateStart.and.returnValue(Promise.reject('Error'));
      const showToastSpy = spyOn(Utils, 'showToast' as any);
      await component['initializeActivityStart'](mockActividad);
      expect(showToastSpy).toHaveBeenCalledWith('Error al iniciar la ruta', 'middle');
    });
  });

  /**
   * Navigation Tests
   */
  describe('Navigation', () => {
    it('should navigate to target for collection service', async () => {
      activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));
      await component.navigateToTarget(mockCard);
      expect(navControllerSpy.navigateForward).toHaveBeenCalled();
    });

    it('should handle navigation error', async () => {
      activitiesServiceSpy.get.and.returnValue(Promise.reject('Error'));
      const showToastSpy = spyOn(Utils, 'showToast' as any);
      await component.navigateToTarget(mockCard);
      expect(showToastSpy).toHaveBeenCalledWith('Error al navegar', 'middle');
    });
  });

  /**
   * Activity Creation Tests
   */
  describe('Activity Creation', () => {
    it('should open add activity modal', async () => {
      const actionSheetSpy = jasmine.createSpyObj('HTMLIonActionSheetElement', ['present']);
      actionSheetControllerSpy.create.and.returnValue(Promise.resolve(actionSheetSpy));
      actionSheetSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { role: 'handler' } }));

      await component.openAddActivity();
      expect(actionSheetControllerSpy.create).toHaveBeenCalled();
    });

    it('should handle add activity error', async () => {
      const actionSheetSpy = jasmine.createSpyObj('HTMLIonActionSheetElement', ['present']);
      actionSheetControllerSpy.create.and.returnValue(Promise.resolve(actionSheetSpy));
      actionSheetSpy.onDidDismiss.and.returnValue(Promise.reject('Error'));

      const showToastSpy = spyOn(Utils, 'showToast' as any);
      await component.openAddActivity();
      expect(showToastSpy).toHaveBeenCalledWith('Error al crear la actividad', 'middle');
    });
  });

  /**
   * Permission Tests
   */
  describe('Permissions', () => {
    it('should handle error when checking permissions', async () => {
      authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.reject('Error'));
      const showToastSpy = spyOn(Utils, 'showToast' as any);
      await component.ngOnInit();
      expect(component.showAdd).toBeFalse();
    });

    it('should update permissions when authorization changes', async () => {
      authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.resolve(false));
      await component.ngOnInit();
      expect(component.showAdd).toBeFalse();
    });
  });
});
