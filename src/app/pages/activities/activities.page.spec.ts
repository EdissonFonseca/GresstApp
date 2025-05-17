import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController, ModalController, AlertController, ActionSheetController } from '@ionic/angular';
import { ActivitiesPage } from './activities.page';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CardService } from '@app/services/core/card.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { Utils } from '@app/utils/utils';
import { Card } from '@app/interfaces/card';
import { Actividad } from '@app/interfaces/actividad.interface';
import { SERVICE_TYPES, STATUS } from '@app/constants/constants';

describe('ActivitiesPage', () => {
  let component: ActivitiesPage;
  let fixture: ComponentFixture<ActivitiesPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let syncServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let actionSheetSpy: jasmine.SpyObj<ActionSheetController>;

  const mockActividad: Actividad = {
    IdActividad: '123',
    IdServicio: SERVICE_TYPES.COLLECTION,
    IdEstado: STATUS.PENDING,
    Titulo: 'Test Activity',
    NavegarPorTransaccion: false,
    FechaInicial: null,
    FechaFinal: null,
    FechaOrden: null,
    IdRecurso: '1'
  };

  const mockCard: Card = {
    id: '123',
    title: 'Test Activity',
    status: STATUS.PENDING,
    type: 'activity'
  };

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['list', 'get', 'updateInicio']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['mapActividades', 'mapActividad']);
    syncServiceSpy = jasmine.createSpyObj('SynchronizationService', ['uploadTransactions']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);

    spyOn(Utils, 'allowAddActivity').and.returnValue(Promise.resolve(true));
    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    spyOn(Utils, 'getStateColor').and.returnValue('success');

    await TestBed.configureTestingModule({
      declarations: [ActivitiesPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: CardService, useValue: cardServiceSpy },
        { provide: SynchronizationService, useValue: syncServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', async () => {
    await component.ngOnInit();
    expect(component.showAdd).toBeTrue();
    expect(component.cantidadCombustible).toBeNull();
    expect(component.kilometraje).toBeNull();
  });

  it('should load activities on ionViewWillEnter', fakeAsync(() => {
    const mockActivities = [mockActividad];
    const mockCards = [mockCard];

    activitiesServiceSpy.list.and.returnValue(Promise.resolve(mockActivities));
    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve(mockCards));

    component.ionViewWillEnter();
    tick();

    expect(activitiesServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapActividades).toHaveBeenCalledWith(mockActivities);
    expect(component.activities()).toEqual(mockCards);
  }));

  it('should filter activities on search input', fakeAsync(() => {
    const mockActivities = [mockActividad];
    const mockCards = [mockCard];

    activitiesServiceSpy.list.and.returnValue(Promise.resolve(mockActivities));
    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve(mockCards));

    const event = { target: { value: 'test' } };
    component.handleInput(event);
    tick();

    expect(activitiesServiceSpy.list).toHaveBeenCalled();
    expect(cardServiceSpy.mapActividades).toHaveBeenCalled();
    expect(component.activities()).toEqual(mockCards);
  }));

  it('should handle mileage prompt for transport activities', fakeAsync(() => {
    const mockAlert: any = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { kilometraje: '100' } })
    };

    alertCtrlSpy.create.and.returnValue(Promise.resolve(mockAlert));

    component.requestMileagePrompt();
    tick();

    expect(alertCtrlSpy.create).toHaveBeenCalled();
    expect(component.kilometraje).toBe(100);
  }));

  it('should navigate to tasks for collection service', fakeAsync(() => {
    const mockActivity = { ...mockCard, id: '123' };
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));

    component.navigateToTarget(mockActivity);
    tick();

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/tareas', jasmine.any(Object));
  }));

  it('should open add activity modal', fakeAsync(() => {
    const mockActionSheet: any = {
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: { IdServicio: SERVICE_TYPES.COLLECTION } })
    };

    actionSheetSpy.create.and.returnValue(Promise.resolve(mockActionSheet));

    component.openAddActivity();
    tick();

    expect(actionSheetSpy.create).toHaveBeenCalled();
  }));

  it('should get state color', () => {
    const color = component.getColorEstado('PENDING');
    expect(Utils.getStateColor).toHaveBeenCalledWith('PENDING');
    expect(color).toBe('success');
  });
});
