import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ThirdPartiesPage } from './third-parties.page';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';
import { StakeholdersComponent } from '@app/components/stakeholders/stakeholders.component';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { Utils } from '@app/utils/utils';
import { Tercero } from '@app/interfaces/tercero.interface';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';

describe('ThirdPartiesPage', () => {
  let component: ThirdPartiesPage;
  let fixture: ComponentFixture<ThirdPartiesPage>;
  let thirdpartiesServiceSpy: jasmine.SpyObj<ThirdpartiesService>;

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

  beforeEach(async () => {
    thirdpartiesServiceSpy = jasmine.createSpyObj('ThirdpartiesService', ['list']);

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        ReactiveFormsModule,
        ComponentsModule,
        ThirdPartiesPage
      ],
      providers: [
        { provide: ThirdpartiesService, useValue: thirdpartiesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdPartiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize successfully', () => {
    expect(component).toBeDefined();
    expect(fixture).toBeDefined();
  });

  it('should have required imports', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled).toBeTruthy();
  });

  it('should render without errors', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.innerHTML).toBeDefined();
  });

  it('should initialize with stakeholders component', () => {
    const compiled = fixture.nativeElement;
    const stakeholdersElement = compiled.querySelector('app-stakeholders');
    expect(stakeholdersElement).toBeTruthy();
  });

  it('should pass showHeader as false to stakeholders component', () => {
    const compiled = fixture.nativeElement;
    const stakeholdersElement = compiled.querySelector('app-stakeholders');
    expect(stakeholdersElement.getAttribute('showHeader')).toBe('false');
  });

  it('should have a back button in the header', () => {
    const compiled = fixture.nativeElement;
    const backButton = compiled.querySelector('ion-back-button');
    expect(backButton).toBeTruthy();
  });

  it('should have the correct title in the header', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    expect(title.textContent).toContain('Terceros');
  });

  it('should load third parties on initialization', async () => {
    thirdpartiesServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
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
});
