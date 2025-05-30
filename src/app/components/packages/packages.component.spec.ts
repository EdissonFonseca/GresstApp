import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PackagesComponent } from './packages.component';
import { PackagingService } from '@app/services/masterdata/packaging.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';

describe('PackagesComponent', () => {
  let component: PackagesComponent;
  let fixture: ComponentFixture<PackagesComponent>;
  let packagingServiceSpy: jasmine.SpyObj<PackagingService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;
  let routeSpy: any;

  const mockPackages = [
    { IdEmbalaje: '1', Nombre: 'Package 1' },
    { IdEmbalaje: '2', Nombre: 'Package 2' }
  ];

  beforeEach(waitForAsync(() => {
    packagingServiceSpy = jasmine.createSpyObj('PackagingService', ['list', 'create']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);
    routeSpy = { queryParams: of({}) };

    packagingServiceSpy.list.and.returnValue(Promise.resolve(mockPackages));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    TestBed.configureTestingModule({
      declarations: [PackagesComponent],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [
        { provide: PackagingService, useValue: packagingServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PackagesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load packages', async () => {
    await component.ngOnInit();
    expect(packagingServiceSpy.list).toHaveBeenCalled();
    expect(component.packages).toEqual(mockPackages);
    expect(component.enableNew).toBeTrue();
  });

  it('should handle input search and filter packages', async () => {
    await component.ngOnInit();
    const event = { target: { value: 'Package 1' } };
    await component.handleInput(event);
    expect(component.packages.length).toBe(1);
    expect(component.packages[0].Nombre).toBe('Package 1');
  });

  it('should show new package form', () => {
    component.new();
    expect(component.showNew).toBeTrue();
    expect(component.formData.get('Nombre')?.value).toBeNull();
  });

  it('should select a package and dismiss modal', () => {
    component.select('1', 'Package 1');
    expect(component.selectedValue).toBe('1');
    expect(component.selectedName).toBe('Package 1');
    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({ id: '1', name: 'Package 1' });
  });

  it('should confirm selection and dismiss modal', () => {
    component.selectedValue = '2';
    component.selectedName = 'Package 2';
    component.confirm();
    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({ id: '2', name: 'Package 2' });
  });

  it('should cancel and dismiss modal with null', () => {
    component.cancel();
    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should create a new package and update list', async () => {
    packagingServiceSpy.create.and.returnValue(Promise.resolve(true));
    packagingServiceSpy.list.and.returnValue(Promise.resolve([...mockPackages, { IdEmbalaje: '3', Nombre: 'New Package' }]));
    component.showHeader = false;
    component.showNew = true;
    component.formData.patchValue({ Nombre: 'New Package' });
    await component.create();
    expect(packagingServiceSpy.create).toHaveBeenCalled();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Embalaje New Package creado', 'middle');
    expect(component.packages.length).toBe(3);
    expect(component.showNew).toBeFalse();
  });

  it('should create a new package and dismiss modal if showHeader is true', async () => {
    packagingServiceSpy.create.and.returnValue(Promise.resolve(true));
    component.showHeader = true;
    component.showNew = true;
    component.formData.patchValue({ Nombre: 'New Package' });
    await component.create();
    expect(packagingServiceSpy.create).toHaveBeenCalled();
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
    expect(component.showNew).toBeFalse();
  });

  it('should render template elements', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-header')).toBeTruthy();
    expect(compiled.querySelector('ion-searchbar')).toBeTruthy();
    expect(compiled.querySelector('ion-list')).toBeTruthy();
    expect(compiled.querySelectorAll('ion-item').length).toBeGreaterThan(0);
  });
});
