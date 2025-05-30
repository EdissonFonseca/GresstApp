import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PackagingPage } from './packaging.page';
import { PackagesComponent } from '@app/components/packages/packages.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { PackagingService } from '@app/services/masterdata/packaging.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';

describe('PackagingPage', () => {
  let component: PackagingPage;
  let fixture: ComponentFixture<PackagingPage>;
  let packagingServiceSpy: jasmine.SpyObj<PackagingService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;

  const mockPackages = [
    { IdEmbalaje: '1', Nombre: 'Package 1' },
    { IdEmbalaje: '2', Nombre: 'Package 2' }
  ];

  beforeEach(async () => {
    packagingServiceSpy = jasmine.createSpyObj('PackagingService', ['list', 'create', 'update']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);

    await TestBed.configureTestingModule({
      declarations: [PackagingPage],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        PackagesComponent
      ],
      providers: [
        { provide: PackagingService, useValue: packagingServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PackagingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render packages component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-packages')).toBeTruthy();
  });

  it('should pass showHeader as false to packages component', () => {
    const packagesComponent = fixture.debugElement.children[0].componentInstance;
    expect(packagesComponent.showHeader).toBeFalse();
  });

  it('should render header with title', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('ion-header');
    expect(header).toBeTruthy();
    expect(header.querySelector('ion-title').textContent).toBe('Embalajes');
  });

  it('should render back button', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-back-button')).toBeTruthy();
  });

  it('should initialize with empty packages list', () => {
    packagingServiceSpy.list.and.returnValue(Promise.resolve([]));
    expect(packagingServiceSpy.list).toHaveBeenCalled();
  });

  it('should load packages on initialization', async () => {
    packagingServiceSpy.list.and.returnValue(Promise.resolve(mockPackages));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    await component.ngOnInit();
    expect(packagingServiceSpy.list).toHaveBeenCalled();
    expect(authorizationServiceSpy.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_PACKAGE);
  });

  it('should handle error when loading packages', async () => {
    packagingServiceSpy.list.and.returnValue(Promise.reject('Error loading packages'));
    await component.ngOnInit();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalled();
  });
});
