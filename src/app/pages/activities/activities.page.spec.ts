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
import { Card } from '@app/interfaces/card';
import { Actividad } from '@app/interfaces/actividad.interface';
import { SERVICE_TYPES } from '@app/constants/constants';

describe('ActivitiesPage', () => {
  let component: ActivitiesPage;
  let fixture: ComponentFixture<ActivitiesPage>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let synchronizationServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

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
    IdEstado: 'active',
    IdServicio: SERVICE_TYPES.COLLECTION,
    FechaInicial: null,
    KilometrajeInicial: null,
    NavegarPorTransaccion: false,
    FechaOrden: null,
    IdRecurso: '1'
  };

  beforeEach(async () => {
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['list', 'get', 'updateInicio']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['mapActividades', 'mapActividad']);
    synchronizationServiceSpy = jasmine.createSpyObj('SynchronizationService', ['uploadData']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['allowAddActivity', 'getPermission']);
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

    activitiesServiceSpy.list.and.returnValue(Promise.resolve([mockActividad]));
    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve([mockCard]));
    cardServiceSpy.mapActividad.and.returnValue(Promise.resolve(mockCard));
    authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.resolve(true));

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showAdd).toBeTrue();
    expect(component.cantidadCombustible).toBeNull();
    expect(component.kilometraje).toBeNull();
  });

  it('should load activities and check permissions on init', async () => {
    await component.ionViewWillEnter();
    expect(activitiesServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapActividades).toHaveBeenCalledWith([mockActividad]);
    expect(component.activities()).toEqual([mockCard]);
  });

  it('should filter activities on input', async () => {
    const event = { target: { value: 'test' } };
    await component.handleInput(event);
    expect(activitiesServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapActividades).toHaveBeenCalled();
  });

  it('should handle mileage prompt', async () => {
    const alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));
    alertSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { kilometraje: '100' } }));

    const result = await component.requestMileagePrompt();
    expect(result).toBeTrue();
    expect(component.kilometraje).toBe(100);
  });

  it('should navigate to target for collection service', async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));
    await component.navigateToTarget(mockCard);
    expect(navControllerSpy.navigateForward).toHaveBeenCalled();
  });

  it('should open add activity modal', async () => {
    const actionSheetSpy = jasmine.createSpyObj('HTMLIonActionSheetElement', ['present']);
    actionSheetControllerSpy.create.and.returnValue(Promise.resolve(actionSheetSpy));
    actionSheetSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { role: 'handler' } }));

    await component.openAddActivity();
    expect(actionSheetControllerSpy.create).toHaveBeenCalled();
  });

  it('should handle error when loading activities', async () => {
    activitiesServiceSpy.list.and.returnValue(Promise.reject('Error'));
    spyOn(Utils, 'showToast');
    await component.ionViewWillEnter();
    expect(Utils.showToast).toHaveBeenCalledWith('Error al cargar las actividades', 'top');
  });

  it('should handle error when checking permissions', async () => {
    authorizationServiceSpy.allowAddActivity.and.returnValue(Promise.reject('Error'));
    spyOn(Utils, 'showToast');
    await component.ngOnInit();
    expect(component.showAdd).toBeFalse();
  });
});
