import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivitiesPage } from './activities.page';
import { IonicModule, ModalController, NavController, AlertController, ActionSheetController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CardService } from '@app/services/core/card.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Card } from '@app/interfaces/card.interface';
import { Actividad } from '@app/interfaces/actividad.interface';
import { SERVICE_TYPES, STATUS } from '@app/constants/constants';

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
    title: 'Test Activity',
    description: 'Test Description',
    status: STATUS.PENDING,
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
    activitiesServiceSpy.list.and.returnValue(Promise.resolve([mockActividad]));
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));
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
        ActivitiesPage
      ],
      providers: [
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
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

    it('should initialize with default values', () => {
      expect(component.showAdd).toBeTrue();
      expect(component.loading()).toBeFalse();
    });
  });

  /**
   * Activity Loading Tests
   */
  describe('Activity Loading', () => {
    it('should load activities and check permissions on init', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(authorizationServiceSpy.allowAddActivity).toHaveBeenCalled();
      expect(activitiesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should handle error when loading activities', fakeAsync(() => {
      activitiesServiceSpy.list.and.returnValue(Promise.reject('Error'));

      component.ngOnInit();
      tick();

      expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
    }));

    it('should load activities on view enter if not loaded', fakeAsync(() => {
      component.ionViewWillEnter();
      tick();

      expect(activitiesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should filter activities on input', fakeAsync(() => {
      const event = { target: { value: 'test' } };
      component.handleInput(event);
      tick();

      expect(activitiesServiceSpy.list).toHaveBeenCalled();
    }));
  });

  /**
   * Activity Management Tests
   */
  describe('Activity Management', () => {
    it('should navigate to target for collection service', fakeAsync(() => {
      const card = { ...mockCard, id: '1' };
      component.navigateToTarget(card);
      tick();

      expect(activitiesServiceSpy.get).toHaveBeenCalledWith('1');
      expect(navControllerSpy.navigateForward).toHaveBeenCalled();
    }));

    it('should handle navigation error', fakeAsync(() => {
      activitiesServiceSpy.get.and.returnValue(Promise.reject('Error'));
      const card = { ...mockCard, id: '1' };

      component.navigateToTarget(card);
      tick();

      expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
    }));
  });

  /**
   * Activity Creation Tests
   */
  describe('Activity Creation', () => {
    it('should open add activity action sheet', fakeAsync(() => {
      authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve('C'));

      component.openAdd();
      tick();

      expect(actionSheetControllerSpy.create).toHaveBeenCalled();
    }));

    it('should handle add activity error', fakeAsync(() => {
      actionSheetControllerSpy.create.and.returnValue(Promise.reject('Error'));

      component.openAdd();
      tick();

      expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
    }));

    it('should present add modal', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { IdActividad: '1' } }));
      modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

      component.presentAdd(SERVICE_TYPES.COLLECTION);
      tick();

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(activitiesServiceSpy.update).toHaveBeenCalled();
    }));

    it('should handle add modal error', fakeAsync(() => {
      modalControllerSpy.create.and.returnValue(Promise.reject('Error'));

      component.presentAdd(SERVICE_TYPES.COLLECTION);
      tick();

      expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
    }));

    it('should open approve modal', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: true }));
      modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

      component.openApprove('1');
      tick();

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(activitiesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should handle approve error', fakeAsync(() => {
      activitiesServiceSpy.get.and.returnValue(Promise.reject('Error'));

      component.openApprove('1');
      tick();

      expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
    }));

    it('should open reject modal', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: true }));
      modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

      component.openReject('1');
      tick();

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(activitiesServiceSpy.list).toHaveBeenCalled();
    }));

    it('should handle reject error', fakeAsync(() => {
      activitiesServiceSpy.get.and.returnValue(Promise.reject('Error'));

      component.openReject('1');
      tick();

      expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
    }));
  });

  /**
   * Permission Tests
   */
  describe('Permissions', () => {
    it('should handle error when checking permissions', fakeAsync(() => {
      authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.reject('Error'));

      component.ngOnInit();
      tick();

      expect(component.showAdd).toBeFalse();
      expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Translated text', 'middle');
    }));

    it('should update permissions when authorization changes', fakeAsync(() => {
      authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.resolve(false));

      component.ngOnInit();
      tick();

      expect(component.showAdd).toBeFalse();
    }));
  });
});
