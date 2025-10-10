import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AccountPage } from './account.page';
import { Storage } from '@ionic/storage';
import { Account } from '@app/domain/entities/account.entity';
import { STORAGE } from '@app/core/constants';

// Alias type to match component usage
type Cuenta = Account & {
  NombreCuenta?: string;
  IdPersonaCuenta?: string;
};

describe('AccountPage', () => {
  let component: AccountPage;
  let fixture: ComponentFixture<AccountPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let storageSpy: jasmine.SpyObj<Storage>;

  const mockAccount: Cuenta = {
    Id: '123',
    PersonId: '123',
    UserPersonId: '456',
    UserId: '789',
    Login: 'test@example.com',
    Name: 'Test Account',
    UserName: 'Test User',
    NombreCuenta: 'Test Account',
    IdPersonaCuenta: '123',
    Settings: {},
    Parameters: {},
    Permissions: {}
  };

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateBack']);
    storageSpy = jasmine.createSpyObj('Storage', ['get']);

    await TestBed.configureTestingModule({
      declarations: [AccountPage],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: NavController, useValue: navCtrlSpy },
        { provide: Storage, useValue: storageSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cuenta).toBeUndefined();
    expect(component.formData.get('Nombre')?.value).toBe('');
    expect(component.formData.get('Identificacion')?.value).toBe('');
    expect(component.formData.get('Cubrimiento')?.value).toBe('');
  });

  it('should load account data on init', fakeAsync(() => {
    storageSpy.get.and.returnValue(Promise.resolve(mockAccount));

    component.ngOnInit();
    tick();

    expect(storageSpy.get).toHaveBeenCalledWith(STORAGE.ACCOUNT);
    expect(component.cuenta).toEqual(mockAccount);
    expect(component.formData.get('Nombre')?.value).toBe(mockAccount.NombreCuenta);
    expect(component.formData.get('Identificacion')?.value).toBe(mockAccount.IdPersonaCuenta);
  }));

  it('should validate form controls', () => {
    const form = component.formData;

    // Test empty form
    expect(form.valid).toBeFalsy();
    expect(form.get('Nombre')?.errors?.['required']).toBeTruthy();
    expect(form.get('Identificacion')?.errors?.['required']).toBeTruthy();
    expect(form.get('Cubrimiento')?.errors?.['required']).toBeTruthy();

    // Test with valid data
    form.setValue({
      Nombre: 'Test Account',
      Identificacion: '123',
      Cubrimiento: 'Test Coverage'
    });
    expect(form.valid).toBeTruthy();
    expect(form.get('Nombre')?.errors).toBeNull();
    expect(form.get('Identificacion')?.errors).toBeNull();
    expect(form.get('Cubrimiento')?.errors).toBeNull();
  });
});
