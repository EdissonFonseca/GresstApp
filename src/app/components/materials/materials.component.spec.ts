import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialsComponent } from './materials.component';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';

describe('MaterialsComponent', () => {
  let component: MaterialsComponent;
  let fixture: ComponentFixture<MaterialsComponent>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;

  const mockMaterials = [
    {
      IdMaterial: '1',
      Nombre: 'Material 1',
      TipoCaptura: 'C',
      TipoMedicion: 'C',
      Factor: 1,
      Aprovechable: true,
      Referencia: 'REF1'
    },
    {
      IdMaterial: '2',
      Nombre: 'Material 2',
      TipoCaptura: 'P',
      TipoMedicion: 'V',
      Factor: 0.001,
      Aprovechable: false,
      Referencia: 'REF2'
    }
  ];

  beforeEach(waitForAsync(() => {
    materialsServiceSpy = jasmine.createSpyObj('MaterialsService', ['list', 'create']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', ['showToast']);

    materialsServiceSpy.list.and.returnValue(Promise.resolve(mockMaterials));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        FormsModule,
        MaterialsComponent
      ],
      providers: [
        { provide: MaterialsService, useValue: materialsServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialsComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showHeader).toBeTrue();
    expect(component.materials).toEqual([]);
    expect(component.selectedValue).toBe('');
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
    expect(component.showFactor).toBeFalse();
    expect(component.showNew).toBeFalse();
    expect(component.enableNew).toBeFalse();
  });

  it('should load materials on init', async () => {
    await component.ngOnInit();
    expect(materialsServiceSpy.list).toHaveBeenCalled();
    expect(component.materials).toEqual(mockMaterials);
    expect(component.enableNew).toBeTrue();
  });

  it('should handle error when loading materials', async () => {
    materialsServiceSpy.list.and.returnValue(Promise.reject('Error'));
    await component.ngOnInit();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al cargar los materiales', 'middle');
  });

  it('should filter materials on search', async () => {
    await component.ngOnInit();
    const event = { target: { value: 'Material 1' } };
    await component.handleInput(event);
    expect(component.materials.length).toBe(1);
    expect(component.materials[0].Nombre).toBe('Material 1');
  });

  it('should handle error when searching materials', async () => {
    await component.ngOnInit();
    materialsServiceSpy.list.and.returnValue(Promise.reject('Error'));
    const event = { target: { value: 'test' } };
    await component.handleInput(event);
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al buscar materiales', 'middle');
  });

  it('should select material and emit event', async () => {
    await component.select('1', 'Material 1', 'C', 'C', 1);
    expect(component.selectedValue).toBe('1');
    expect(component.selectedName).toBe('Material 1');
    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({
      id: '1',
      name: 'Material 1',
      capture: 'C',
      measure: 'C',
      factor: 1
    });
  });

  it('should handle error when selecting material', async () => {
    modalControllerSpy.dismiss.and.returnValue(Promise.reject('Error'));
    await component.select('1', 'Material 1', 'C', 'C', 1);
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al seleccionar el material', 'middle');
  });

  it('should show new material form', () => {
    component.new();
    expect(component.showNew).toBeTrue();
    expect(component.formData.get('Nombre')?.value).toBeNull();
    expect(component.formData.get('Referencia')?.value).toBeNull();
    expect(component.formData.get('Captura')?.value).toBeNull();
    expect(component.formData.get('Medicion')?.value).toBeNull();
    expect(component.formData.get('Factor')?.value).toBeNull();
    expect(component.formData.get('Aprovechable')?.value).toBeFalse();
  });

  it('should hide new material form', () => {
    component.showNew = true;
    component.search();
    expect(component.showNew).toBeFalse();
  });

  it('should create new material', async () => {
    materialsServiceSpy.create.and.returnValue(Promise.resolve(true));
    component.showNew = true;
    component.formData.patchValue({
      Nombre: 'New Material',
      Referencia: 'REF3',
      Captura: 'Cantidad',
      Medicion: 'Peso',
      Factor: 0.001,
      Aprovechable: true
    });

    await component.create();
    expect(materialsServiceSpy.create).toHaveBeenCalled();
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
  });

  it('should handle error when creating material', async () => {
    materialsServiceSpy.create.and.returnValue(Promise.resolve(false));
    component.showNew = true;
    component.formData.patchValue({
      Nombre: 'New Material',
      Referencia: 'REF3',
      Captura: 'Cantidad',
      Medicion: 'Peso',
      Factor: 0.001,
      Aprovechable: true
    });

    await component.create();
    expect(userNotificationServiceSpy.showToast).toHaveBeenCalledWith('Error al crear el material', 'middle');
  });

  it('should show factor input when measurement differs from capture', () => {
    component.formData.patchValue({
      Captura: 'Cantidad',
      Medicion: 'Peso'
    });
    component.onChangeMedida('Peso');
    expect(component.showFactor).toBeTrue();
  });

  it('should hide factor input when measurement matches capture', () => {
    component.formData.patchValue({
      Captura: 'Cantidad',
      Medicion: 'Cantidad'
    });
    component.onChangeMedida('Cantidad');
    expect(component.showFactor).toBeFalse();
  });

  it('should convert measurement types correctly', () => {
    expect(component['convertMedida']('Cantidad')).toBe('C');
    expect(component['convertMedida']('Peso')).toBe('P');
    expect(component['convertMedida']('Volumen')).toBe('V');
    expect(component['convertMedida']('Other')).toBe('Other');
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(null);
  });
});
