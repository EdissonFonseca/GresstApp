import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ThirdPartiesPage } from './third-parties.page';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';
import { StakeholdersComponent } from '@app/components/stakeholders/stakeholders.component';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { Tercero } from '@app/interfaces/tercero.interface';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';
import { AuthorizationService } from '@app/services/core/authorization.services';

describe('ThirdPartiesPage', () => {
  let component: ThirdPartiesPage;
  let fixture: ComponentFixture<ThirdPartiesPage>;
  let thirdpartiesServiceSpy: jasmine.SpyObj<ThirdpartiesService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;

  const mockTerceros: Tercero[] = [
    {
      IdPersona: '1',
      Nombre: 'Test Client',
      Identificacion: '123456',
      Correo: 'test@test.com',
      Telefono: '1234567890',
      Cliente: true,
      Proveedor: false,
      Empleado: false
    },
    {
      IdPersona: '2',
      Nombre: 'Test Supplier',
      Identificacion: '789012',
      Correo: 'supplier@test.com',
      Telefono: '0987654321',
      Cliente: false,
      Proveedor: true,
      Empleado: false
    }
  ];

  beforeEach(waitForAsync(() => {
    thirdpartiesServiceSpy = jasmine.createSpyObj('ThirdpartiesService', ['list']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        ComponentsModule,
        ThirdPartiesPage
      ],
      providers: [
        { provide: ThirdpartiesService, useValue: thirdpartiesServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdPartiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize successfully', () => {
    expect(component).toBeDefined();
    expect(fixture).toBeDefined();
  });

  it('should render header with back button and title', () => {
    const compiled = fixture.nativeElement;
    const backButton = compiled.querySelector('ion-back-button');
    const title = compiled.querySelector('ion-title');

    expect(backButton).toBeTruthy();
    expect(title.textContent).toContain('Terceros');
  });

  it('should render stakeholders component', () => {
    const compiled = fixture.nativeElement;
    const stakeholdersElement = compiled.querySelector('app-stakeholders');
    expect(stakeholdersElement).toBeTruthy();
  });

  it('should pass showHeader as false to stakeholders component', () => {
    const compiled = fixture.nativeElement;
    const stakeholdersElement = compiled.querySelector('app-stakeholders');
    expect(stakeholdersElement.getAttribute('showHeader')).toBe('false');
  });

  it('should render content with fullscreen attribute', () => {
    const compiled = fixture.nativeElement;
    const content = compiled.querySelector('ion-content');
    expect(content).toBeTruthy();
    expect(content.getAttribute('fullscreen')).toBe('true');
  });

  it('should load third parties on initialization', async () => {
    thirdpartiesServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    await component.ngOnInit();
    expect(thirdpartiesServiceSpy.list).toHaveBeenCalled();
  });

  it('should handle error when loading third parties', async () => {
    const error = new Error('Failed to load third parties');
    thirdpartiesServiceSpy.list.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    await component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Error loading third parties:', error);
  });

  it('should check permissions on initialization', async () => {
    thirdpartiesServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    await component.ngOnInit();
    expect(authorizationServiceSpy.getPermission).toHaveBeenCalledWith(PERMISSIONS.APP_THIRD_PARTY);
  });

  it('should handle permission check error', async () => {
    thirdpartiesServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
    const error = new Error('Permission check failed');
    authorizationServiceSpy.getPermission.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    await component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Error checking permissions:', error);
  });
});
