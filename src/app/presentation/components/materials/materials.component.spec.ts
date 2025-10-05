import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialsComponent } from './materials.component';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { ModalController } from '@ionic/angular';

describe('MaterialsComponent', () => {
  let component: MaterialsComponent;
  let fixture: ComponentFixture<MaterialsComponent>;
  let materialsServiceSpy: jasmine.SpyObj<MaterialsService>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    materialsServiceSpy = jasmine.createSpyObj('MaterialsService', ['list', 'create']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission']);
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        MaterialsComponent
      ],
      providers: [
        { provide: MaterialsService, useValue: materialsServiceSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showHeader).toBeTrue();
    expect(component.selectedValue).toBe('');
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
    expect(component.showFactor).toBeFalse();
    expect(component.showNew).toBeFalse();
    expect(component.enableNew).toBeFalse();
  });

  it('should load materials on init', async () => {
    const mockMaterials = [
      { IdMaterial: '1', Nombre: 'Material 1', TipoCaptura: 'C', TipoMedicion: 'C', Factor: 1, Aprovechable: true },
      { IdMaterial: '2', Nombre: 'Material 2', TipoCaptura: 'P', TipoMedicion: 'P', Factor: 1, Aprovechable: false }
    ];
    materialsServiceSpy.list.and.returnValue(Promise.resolve(mockMaterials));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve('C'));

    await component.ngOnInit();
    expect(component.materials).toEqual(mockMaterials);
    expect(component.enableNew).toBeTrue();
  });

  it('should handle input search', async () => {
    const mockMaterials = [
      { IdMaterial: '1', Nombre: 'Material 1', TipoCaptura: 'C', TipoMedicion: 'C', Factor: 1, Aprovechable: true },
      { IdMaterial: '2', Nombre: 'Material 2', TipoCaptura: 'P', TipoMedicion: 'P', Factor: 1, Aprovechable: false }
    ];
    materialsServiceSpy.list.and.returnValue(Promise.resolve(mockMaterials));

    const event = { target: { value: 'Material 1' } };
    await component.handleInput(event);

    expect(component.selectedName).toBe('Material 1');
    expect(component.searchText).toBe('Material 1');
    expect(component.materials.length).toBe(1);
    expect(component.materials[0].Nombre).toBe('Material 1');
  });

  it('should select material', () => {
    const idMaterial = '1';
    const nombre = 'Material 1';
    const captura = 'C';
    const medicion = 'C';
    const factor = 1;

    component.select(idMaterial, nombre, captura, medicion, factor);

    expect(component.selectedValue).toBe(idMaterial);
    expect(component.selectedName).toBe(nombre);
    expect(component.selectedCaptura).toBe(captura);
    expect(component.selectedMedicion).toBe(medicion);
    expect(component.selectedFactor).toBe(factor);
    expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({
      id: idMaterial,
      name: nombre,
      capture: captura,
      measure: medicion,
      factor: factor
    });
  });

  it('should create new material', async () => {
    const mockMaterial = {
      IdMaterial: '1',
      Nombre: 'New Material',
      TipoCaptura: 'C',
      TipoMedicion: 'C',
      Factor: 1,
      Aprovechable: true
    };
    materialsServiceSpy.create.and.returnValue(Promise.resolve(true));
    materialsServiceSpy.list.and.returnValue(Promise.resolve([mockMaterial]));

    component.formData.setValue({
      Nombre: 'New Material',
      Captura: 'Cantidad',
      Medicion: 'Cantidad',
      Factor: 1,
      Aprovechable: true,
      Referencia: null
    });

    await component.create();

    expect(materialsServiceSpy.create).toHaveBeenCalled();
    expect(component.showNew).toBeFalse();
  });
});
