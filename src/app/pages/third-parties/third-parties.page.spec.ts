import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ThirdPartiesPage } from './third-parties.page';
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
  let stakeholdersComponent: StakeholdersComponent;

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
    thirdpartiesServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));

    spyOn(Utils, 'getPermission').and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    TestBed.configureTestingModule({
      declarations: [ThirdPartiesPage],
      imports: [
        IonicModule.forRoot(),
        ComponentsModule
      ],
      providers: [
        { provide: ThirdpartiesService, useValue: thirdpartiesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdPartiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
