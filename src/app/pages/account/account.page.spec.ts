import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountPage } from './account.page';
import { Storage } from '@ionic/storage';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';

describe('AccountPage', () => {
  let component: AccountPage;
  let fixture: ComponentFixture<AccountPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let storageSpy: jasmine.SpyObj<Storage>;

  const mockCuenta: Cuenta = {
    IdCuenta: '123',
    IdPersonaCuenta: '123',
    IdPersonaUsuario: '456',
    IdUsuario: '789',
    LoginUsuario: 'test@example.com',
    NombreCuenta: 'Test Account',
    NombreUsuario: 'Test User',
    Ajustes: {},
    Parametros: {},
    Permisos: {}
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
        { provide: NavController, useValue: navCtrlSpy },
        { provide: Storage, useValue: storageSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cuenta).toBeUndefined();
    expect(component.formData.get('Nombre')?.value).toBe('');
    expect(component.formData.get('Identificacion')?.value).toBe('');
  });

  it('should load account data on init', fakeAsync(() => {
    storageSpy.get.and.returnValue(Promise.resolve(mockCuenta));

    component.ngOnInit();
    tick();

    expect(storageSpy.get).toHaveBeenCalledWith('Cuenta');
    expect(component.cuenta).toEqual(mockCuenta);
    expect(component.formData.get('Nombre')?.value).toBe(mockCuenta.NombreCuenta);
    expect(component.formData.get('Identificacion')?.value).toBe(mockCuenta.IdPersonaCuenta);
  }));

  it('should handle storage error on init', fakeAsync(() => {
    storageSpy.get.and.returnValue(Promise.reject('Error'));

    component.ngOnInit();
    tick();

    expect(storageSpy.get).toHaveBeenCalledWith('Cuenta');
    expect(component.cuenta).toBeUndefined();
    expect(component.formData.get('Nombre')?.value).toBe('');
    expect(component.formData.get('Identificacion')?.value).toBe('');
  }));

  it('should validate form controls', () => {
    const form = component.formData;

    // Test empty form
    expect(form.valid).toBeFalsy();

    // Test with valid data
    form.setValue({
      Nombre: 'Test Account',
      Identificacion: '123'
    });
    expect(form.valid).toBeTruthy();
  });

  it('should update form values correctly', () => {
    const testData = {
      Nombre: 'New Account Name',
      Identificacion: '456'
    };

    component.formData.patchValue(testData);

    expect(component.formData.get('Nombre')?.value).toBe(testData.Nombre);
    expect(component.formData.get('Identificacion')?.value).toBe(testData.Identificacion);
  });

  it('should mark form controls as invalid when empty', () => {
    const form = component.formData;

    // Test empty values
    form.setValue({
      Nombre: '',
      Identificacion: ''
    });

    expect(form.get('Nombre')?.valid).toBeFalsy();
    expect(form.get('Identificacion')?.valid).toBeFalsy();
  });
});
