import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PackagesComponent } from './packages.component';
import { PackagingService } from '@app/infrastructure/repositories/package.repository';
import { AuthorizationService } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { Embalaje } from '@app/domain/entities/package.entity';

describe('PackagesComponent', () => {
  let component: PackagesComponent;
  let fixture: ComponentFixture<PackagesComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let packagingServiceSpy: jasmine.SpyObj<PackagingService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockPackages: Embalaje[] = [
    {
      IdEmbalaje: '1',
      Nombre: 'Paquete 1'
    },
    {
      IdEmbalaje: '2',
      Nombre: 'Paquete 2'
    }
  ];

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    packagingServiceSpy = jasmine.createSpyObj('PackagingService', ['list', 'create']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: jasmine.createSpy('queryParams').and.returnValue(jasmine.createSpy('subscribe'))
    });

    packagingServiceSpy.list.and.returnValue(Promise.resolve(mockPackages));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve([CRUD_OPERATIONS.CREATE, CRUD_OPERATIONS.READ]));

    TestBed.configureTestingModule({
      declarations: [PackagesComponent],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: PackagingService, useValue: packagingServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize packages list on init', async () => {
    await component.ngOnInit();
    expect(packagingServiceSpy.list).toHaveBeenCalled();
    expect(component.packages).toEqual(mockPackages);
  });

  it('should check permissions on creation', async () => {
    await component.ngOnInit();
    expect(authorizationServiceSpy.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_PACKAGE);
  });

  it('should filter packages on search input', async () => {
    const mockEvent = { target: { value: 'Paquete 1' } };
    await component.handleInput(mockEvent);

    expect(packagingServiceSpy.list).toHaveBeenCalledTimes(2); // Once in ngOnInit, once in handleInput
    expect(component.searchText).toBe('Paquete 1');
    expect(component.packages.length).toBe(1);
    expect(component.packages[0].Nombre).toBe('Paquete 1');
  });

  it('should select package and dismiss modal', () => {
    component.select('1');
    expect(component.selectedValue).toBe('1');
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith('1', 'confirm');
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should show new form when new() is called', () => {
    component.new();
    expect(component.showNew).toBe(true);
    expect(component.formData.get('Nombre')?.value).toBeNull();
  });

  it('should create new package successfully', async () => {
    packagingServiceSpy.create.and.returnValue(Promise.resolve(true));
    component.showHeader = true;
    component.formData.get('Nombre')?.setValue('Nuevo Paquete');

    await component.create();

    expect(packagingServiceSpy.create).toHaveBeenCalled();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'Nuevo Paquete'
      })
    );
    expect(component.showNew).toBe(false);
  });

  it('should create new package without header and show toast', async () => {
    packagingServiceSpy.create.and.returnValue(Promise.resolve(true));
    component.showHeader = false;
    component.formData.get('Nombre')?.setValue('Nuevo Paquete');

    await component.create();

    expect(packagingServiceSpy.create).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Paquete Nuevo Paquete creado', 'middle');
    expect(component.selectedValue).toBe('');
    expect(component.searchText).toBe('');
  });
});
