import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SuppliesComponent } from './supplies.component';
import { SuppliesService } from '@app/infrastructure/repositories/masterdata/supplies.repository';
import { AuthorizationService } from '@app/infrastructure/repositories/masterdata/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { Insumo } from '@app/domain/entities/insumo.entity';

describe('SuppliesComponent', () => {
  let component: SuppliesComponent;
  let fixture: ComponentFixture<SuppliesComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let suppliesServiceSpy: jasmine.SpyObj<SuppliesService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockSupplies: Insumo[] = [
    {
      IdInsumo: '1',
      Nombre: 'Insumo 1',
      IdEstado: 'A'
    },
    {
      IdInsumo: '2',
      Nombre: 'Insumo 2',
      IdEstado: 'A'
    }
  ];

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    suppliesServiceSpy = jasmine.createSpyObj('SuppliesService', ['list', 'create']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', ['queryParams']);

    TestBed.configureTestingModule({
      declarations: [SuppliesComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: SuppliesService, useValue: suppliesServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showHeader).toBeTrue();
    expect(component.supplies).toEqual([]);
    expect(component.selectedValue).toBe('');
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
    expect(component.enableNew).toBeFalse();
    expect(component.showNew).toBeFalse();
  });

  it('should load supplies and check permissions on init', async () => {
    suppliesServiceSpy.list.and.returnValue(Promise.resolve(mockSupplies));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    await component.ngOnInit();

    expect(suppliesServiceSpy.list).toHaveBeenCalled();
    expect(authorizationServiceSpy.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_SUPPLY);
    expect(component.supplies).toEqual(mockSupplies);
    expect(component.enableNew).toBeTrue();
  });

  it('should handle input search', async () => {
    suppliesServiceSpy.list.and.returnValue(Promise.resolve(mockSupplies));
    const mockEvent = { target: { value: 'Insumo 1' } };

    await component.handleInput(mockEvent);

    expect(component.selectedName).toBe('Insumo 1');
    expect(component.searchText).toBe('Insumo 1');
    expect(component.supplies.length).toBe(1);
    expect(component.supplies[0].Nombre).toBe('Insumo 1');
  });

  it('should select supply and dismiss modal', () => {
    component.select('1');
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith('1', 'confirm');
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should show new form', () => {
    component.new();
    expect(component.showNew).toBeTrue();
    expect(component.formData.get('Nombre')?.value).toBeNull();
  });

  it('should create new supply', async () => {
    suppliesServiceSpy.create.and.returnValue(Promise.resolve(true));
    component.showHeader = true;
    component.formData.setValue({
      Nombre: 'Nuevo Insumo'
    });

    await component.create();

    expect(suppliesServiceSpy.create).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
    expect(component.showNew).toBeFalse();
  });

  it('should handle error when creating supply', async () => {
    suppliesServiceSpy.create.and.returnValue(Promise.resolve(false));
    component.showHeader = true;
    component.formData.setValue({
      Nombre: 'Nuevo Insumo'
    });

    await component.create();

    expect(suppliesServiceSpy.create).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
    expect(component.showNew).toBeTrue();
  });
});
