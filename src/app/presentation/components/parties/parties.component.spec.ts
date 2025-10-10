import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PartiesComponent } from './parties.component';
import { PartiesService } from '@app/infrastructure/repositories/party.repository';
import { AuthorizationService } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { Tercero } from '@app/domain/entities/party.entity';

describe('PartiesComponent', () => {
  let component: PartiesComponent;
  let fixture: ComponentFixture<PartiesComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let partiesServiceSpy: jasmine.SpyObj<PartiesService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  const mockTerceros: Tercero[] = [
    {
      IdPersona: '1',
      Nombre: 'Tercero 1',
      Identificacion: '123',
      Correo: 'tercero1@test.com',
      Telefono: '1234567890',
      Cliente: true
    },
    {
      IdPersona: '2',
      Nombre: 'Tercero 2',
      Identificacion: '456',
      Correo: 'tercero2@test.com',
      Telefono: '0987654321',
      Proveedor: true
    }
  ];

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    partiesServiceSpy = jasmine.createSpyObj('PartiesService', ['list', 'create']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);

    TestBed.configureTestingModule({
      declarations: [PartiesComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: PartiesService, useValue: partiesServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: NavController, useValue: navCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartiesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showHeader).toBeTrue();
    expect(component.terceros).toEqual([]);
    expect(component.selectedValue).toBe('');
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
    expect(component.enableNew).toBeFalse();
    expect(component.showNew).toBeFalse();
  });

  it('should load terceros and check permissions on init', async () => {
    partiesServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    await component.ngOnInit();

    expect(partiesServiceSpy.list).toHaveBeenCalled();
    expect(authorizationServiceSpy.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_THIRD_PARTY);
    expect(component.terceros).toEqual(mockTerceros);
    expect(component.enableNew).toBeTrue();
  });

  it('should handle input search', async () => {
    partiesServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
    const mockEvent = { target: { value: 'Tercero 1' } };

    await component.handleInput(mockEvent);

    expect(component.selectedName).toBe('Tercero 1');
    expect(component.searchText).toBe('Tercero 1');
    expect(component.terceros.length).toBe(1);
    expect(component.terceros[0].Nombre).toBe('Tercero 1');
  });

  it('should select tercero and dismiss modal', () => {
    component.select('1', 'Tercero 1');
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({ id: '1', name: 'Tercero 1' });
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should show new form', () => {
    component.new();
    expect(component.showNew).toBeTrue();
    expect(component.formData.get('Nombre')?.value).toBeNull();
    expect(component.formData.get('Identificacion')?.value).toBeNull();
    expect(component.formData.get('Telefono')?.value).toBeNull();
    expect(component.formData.get('Correo')?.value).toBeNull();
  });

  it('should create new tercero', async () => {
    partiesServiceSpy.create.and.returnValue(Promise.resolve(true));
    component.showHeader = true;
    component.formData.setValue({
      Nombre: 'Nuevo Tercero',
      Identificacion: '789',
      Telefono: '5555555555',
      Correo: 'nuevo@test.com'
    });

    await component.create();

    expect(partiesServiceSpy.create).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
    expect(component.showNew).toBeFalse();
  });

  it('should navigate to puntos', () => {
    component.goToPuntos('1');
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/puntos/1');
  });
});

