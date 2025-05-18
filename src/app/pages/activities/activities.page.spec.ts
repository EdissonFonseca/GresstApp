import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, AlertController, ActionSheetController, NavController } from '@ionic/angular';
import { ActivitiesPage } from './activities.page';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CardService } from '@app/services/core/card.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { Utils } from '@app/utils/utils';
import { Card } from '@app/interfaces/card';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { CRUD_OPERATIONS, PERMISSIONS, SERVICE_TYPES, SERVICES } from '@app/constants/constants';

describe('ActivitiesPage', () => {
  let component: ActivitiesPage;
  let fixture: ComponentFixture<ActivitiesPage>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let synchronizationServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let utilsSpy: jasmine.SpyObj<typeof Utils>;

  const mockCard: Card = {
    id: '1',
    title: 'Test Activity',
    description: 'Test Description',
    status: 'active',
    type: 'activity'
  };

  const mockActividad: Actividad = {
    IdActividad: '1',
    Titulo: 'Test Activity',
    IdEstado: 'active',
    FechaInicial: null,
    IdServicio: SERVICE_TYPES.COLLECTION,
    NavegarPorTransaccion: false,
    FechaOrden: null,
    IdRecurso: '1'
  };

  beforeEach(async () => {
    const activitiesSpy = jasmine.createSpyObj('ActivitiesService', ['list', 'get', 'updateInicio']);
    const cardSpy = jasmine.createSpyObj('CardService', ['mapActividades', 'mapActividad']);
    const syncSpy = jasmine.createSpyObj('SynchronizationService', ['uploadTransactions']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    const authSpy = jasmine.createSpyObj('AuthorizationService', ['allowAddActivity', 'getPermission']);
    const utilsSpyObj = jasmine.createSpyObj('Utils', ['showLoading', 'hideLoading', 'requestMileage']);

    await TestBed.configureTestingModule({
      declarations: [ActivitiesPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivitiesService, useValue: activitiesSpy },
        { provide: CardService, useValue: cardSpy },
        { provide: SynchronizationService, useValue: syncSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: NavController, useValue: navSpy },
        { provide: AuthorizationService, useValue: authSpy },
        { provide: Utils, useValue: utilsSpyObj }
      ]
    }).compileComponents();

    activitiesServiceSpy = TestBed.inject(ActivitiesService) as jasmine.SpyObj<ActivitiesService>;
    cardServiceSpy = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    synchronizationServiceSpy = TestBed.inject(SynchronizationService) as jasmine.SpyObj<SynchronizationService>;
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    actionSheetControllerSpy = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
    navControllerSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    authorizationServiceSpy = TestBed.inject(AuthorizationService) as jasmine.SpyObj<AuthorizationService>;
    utilsSpy = TestBed.inject(Utils) as unknown as jasmine.SpyObj<typeof Utils>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showAdd).toBe(true);
    expect(component.cantidadCombustible).toBeNull();
    expect(component.kilometraje).toBeNull();
  });

  it('should check permissions on init', fakeAsync(() => {
    authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.resolve(true));

    component.ngOnInit();
    tick();

    expect(authorizationServiceSpy.allowAddActivity).toHaveBeenCalled();
    expect(component.showAdd).toBe(true);
  }));

  it('should load activities on ionViewWillEnter', fakeAsync(() => {
    const mockActivities = [mockActividad];
    const mockMappedActivities = [mockCard];
    activitiesServiceSpy.list.and.returnValue(Promise.resolve(mockActivities));
    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve(mockMappedActivities));

    component.ionViewWillEnter();
    tick();

    expect(activitiesServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapActividades).toHaveBeenCalledWith(mockActivities);
    expect(component.activities()).toEqual(mockMappedActivities);
  }));

  it('should handle search input', fakeAsync(() => {
    const mockActivities = [mockActividad];
    const mockMappedActivities = [mockCard];
    activitiesServiceSpy.list.and.returnValue(Promise.resolve(mockActivities));
    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve(mockMappedActivities));

    const event = { target: { value: 'test' } };
    component.handleInput(event);
    tick();

    expect(activitiesServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapActividades).toHaveBeenCalled();
    expect(component.activities()).toEqual(mockMappedActivities);
  }));

  it('should handle mileage prompt', fakeAsync(() => {
    const alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    alertSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { kilometraje: '100' } }));
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));

    component.requestMileagePrompt();
    tick();

    expect(alertControllerSpy.create).toHaveBeenCalled();
    expect(alertSpy.present).toHaveBeenCalled();
    expect(component.kilometraje).toBe(100);
  }));

  it('should navigate to target for collection service', fakeAsync(() => {
    const mockActivity = { ...mockCard, id: '1' };
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));
    utilsSpy.requestMileage = true;

    const alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    alertSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { kilometraje: '100' } }));
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));

    component.navigateToTarget(mockActivity);
    tick();

    expect(activitiesServiceSpy.get).toHaveBeenCalledWith('1');
    expect(utilsSpy.showLoading).toHaveBeenCalledWith('Iniciando ruta');
    expect(activitiesServiceSpy.updateInicio).toHaveBeenCalled();
    expect(utilsSpy.hideLoading).toHaveBeenCalled();
    expect(synchronizationServiceSpy.uploadTransactions).toHaveBeenCalled();
    expect(navControllerSpy.navigateForward).toHaveBeenCalled();
  }));

  it('should open add activity action sheet', fakeAsync(() => {
    const actionSheetSpy = jasmine.createSpyObj('HTMLIonActionSheetElement', ['present']);
    actionSheetControllerSpy.create.and.returnValue(Promise.resolve(actionSheetSpy));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    component.openAddActivity();
    tick();

    expect(authorizationServiceSpy.getPermission).toHaveBeenCalled();
    expect(actionSheetControllerSpy.create).toHaveBeenCalled();
    expect(actionSheetSpy.present).toHaveBeenCalled();
  }));

  it('should present modal for adding activity', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { IdActividad: '1' } }));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));
    cardServiceSpy.mapActividad.and.returnValue(Promise.resolve(mockCard));

    component.presentModal(SERVICE_TYPES.COLLECTION);
    tick();

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(modalSpy.present).toHaveBeenCalled();
    expect(utilsSpy.showLoading).toHaveBeenCalledWith('Actualizando información');
  }));
});
