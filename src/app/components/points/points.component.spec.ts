import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { PointsComponent } from './points.component';
import { PointsService } from '@app/services/masterdata/points.service';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { of } from 'rxjs';
import { PERMISSIONS, CRUD_OPERATIONS, THIRD_PARTY_TYPES } from '@app/constants/constants';

const mockTerceros = [
  { IdPersona: '1', Nombre: 'Cliente 1', Cliente: true, Proveedor: false, Empleado: false, Identificacion: '111', Telefono: '123' },
  { IdPersona: '2', Nombre: 'Proveedor 1', Cliente: false, Proveedor: true, Empleado: false, Identificacion: '222', Telefono: '456' },
  { IdPersona: '3', Nombre: 'Empleado 1', Cliente: false, Proveedor: false, Empleado: true, Identificacion: '333', Telefono: '789' }
];

const mockPuntos = [
  { IdDeposito: 'p1', IdPersona: '1', Nombre: 'Punto Cliente', IdMateriales: [], Tipo: '', Acopio: false, Almacenamiento: false, Direccion: '', Descripcion: '', Latitud: '', Longitud: '', Activo: true, Disposicion: false, Entrega: false, Generacion: false, Recepcion: false, Tratamiento: false },
  { IdDeposito: 'p2', IdPersona: '2', Nombre: 'Punto Proveedor', IdMateriales: [], Tipo: '', Acopio: false, Almacenamiento: false, Direccion: '', Descripcion: '', Latitud: '', Longitud: '', Activo: true, Disposicion: false, Entrega: false, Generacion: false, Recepcion: false, Tratamiento: false },
  { IdDeposito: 'p3', IdPersona: '3', Nombre: 'Punto Empleado', IdMateriales: [], Tipo: '', Acopio: false, Almacenamiento: false, Direccion: '', Descripcion: '', Latitud: '', Longitud: '', Activo: true, Disposicion: false, Entrega: false, Generacion: false, Recepcion: false, Tratamiento: false }
];

describe('PointsComponent', () => {
  let component: PointsComponent;
  let fixture: ComponentFixture<PointsComponent>;
  let pointsServiceSpy: jasmine.SpyObj<PointsService>;
  let thirdpartiesServiceSpy: jasmine.SpyObj<ThirdpartiesService>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;

  beforeEach(waitForAsync(() => {
    pointsServiceSpy = jasmine.createSpyObj('PointsService', ['list']);
    thirdpartiesServiceSpy = jasmine.createSpyObj('ThirdpartiesService', ['list']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    authorizationServiceSpy = jasmine.createSpyObj('AuthorizationService', ['getPermission', 'getPersonId']);

    pointsServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));
    thirdpartiesServiceSpy.list.and.returnValue(Promise.resolve(mockTerceros));
    authorizationServiceSpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('1'));

    TestBed.configureTestingModule({
      declarations: [PointsComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: PointsService, useValue: pointsServiceSpy },
        { provide: ThirdpartiesService, useValue: thirdpartiesServiceSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AuthorizationService, useValue: authorizationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PointsComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load points and terceros', async () => {
    component.idTercero = '';
    await component.ngOnInit();
    expect(thirdpartiesServiceSpy.list).toHaveBeenCalled();
    expect(pointsServiceSpy.list).toHaveBeenCalled();
    expect(component.terceros.length).toBe(3);
    expect(component.puntos.length).toBe(3);
    expect(component.enableNew).toBeTrue();
  });

  it('should filter by idTercero', async () => {
    component.idTercero = '1';
    await component.ngOnInit();
    expect(component.terceros.length).toBe(1);
    expect(component.puntos.length).toBe(1);
    expect(component.puntos[0].Nombre).toBe('Punto Cliente');
  });

  it('should filter by tipoTercero CLIENT', async () => {
    component.idTercero = '';
    component.tipoTercero = THIRD_PARTY_TYPES.CLIENT;
    await component.ngOnInit();
    expect(component.terceros.length).toBe(1);
    expect(component.terceros[0].Cliente).toBeTrue();
  });

  it('should filter by tipoTercero SUPPLIER', async () => {
    component.idTercero = '';
    component.tipoTercero = THIRD_PARTY_TYPES.SUPPLIER;
    await component.ngOnInit();
    expect(component.terceros.length).toBe(1);
    expect(component.terceros[0].Proveedor).toBeTrue();
  });

  it('should filter by tipoTercero INTERNAL', async () => {
    component.idTercero = '';
    component.tipoTercero = THIRD_PARTY_TYPES.INTERNAL;
    await component.ngOnInit();
    expect(component.terceros.length).toBe(1);
    expect(component.terceros[0].Empleado).toBeTrue();
  });

  it('should filter puntos by idTercero', async () => {
    component.idTercero = '2';
    await component.ngOnInit();
    const filtered = component.filterPuntos('2');
    expect(filtered.length).toBe(1);
    expect(filtered[0].Nombre).toBe('Punto Proveedor');
  });

  it('should handle input search and filter points', async () => {
    await component.ngOnInit();
    const event = { target: { value: 'Cliente' } };
    await component.handleInput(event);
    expect(component.filteredPuntos.length).toBe(1);
    expect(component.filteredPuntos[0].Nombre).toBe('Punto Cliente');
  });

  it('should select a point and dismiss modal', async () => {
    await component.ngOnInit();
    await component.select('p1', '1', 'Cliente 1', 'Punto Cliente');
    expect(component.selectedValue).toBe('p1');
    expect(component.selectedName).toBe('Punto Cliente');
    expect(component.selectedOwner).toBe('1');
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      id: 'p1',
      name: 'Punto Cliente',
      owner: '1',
      ownerName: 'Cliente 1'
    });
  });

  it('should select a point and set selectedName with owner if not self', async () => {
    authorizationServiceSpy.getPersonId.and.returnValue(Promise.resolve('2'));
    await component.ngOnInit();
    await component.select('p1', '1', 'Cliente 1', 'Punto Cliente');
    expect(component.selectedName).toBe('Cliente 1 - Punto Cliente');
  });

  it('should cancel and dismiss modal with null', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should render template elements', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-header')).toBeTruthy();
    expect(compiled.querySelector('ion-searchbar')).toBeTruthy();
    expect(compiled.querySelector('ion-content')).toBeTruthy();
  });
});
