import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FacilitiesComponent } from './facilities.component';
import { FacilityRepository } from '@app/infrastructure/repositories/facility.repository';
import { PartyRepository } from '@app/infrastructure/repositories/party.repository';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { of } from 'rxjs';
import { PERMISSIONS, CRUD_OPERATIONS, THIRD_PARTY_TYPES } from '@app/core/constants';

const mockParties = [
  { Id: '1', Name: 'Cliente 1', IsClient: true, IsProvider: false, IsEmployee: false, Identification: '111', Phone: '123' },
  { Id: '2', Name: 'Proveedor 1', IsClient: false, IsProvider: true, IsEmployee: false, Identification: '222', Phone: '456' },
  { Id: '3', Name: 'Empleado 1', IsClient: false, IsProvider: false, IsEmployee: true, Identification: '333', Phone: '789' }
];

const mockFacilities = [
  { Id: 'p1', OwnerId: '1', Name: 'Punto Cliente', ParentId: '', Address: '', Latitude: '', Longitude: '', LocationId: '', IsDelivery: false, IsDisposal: false, IsHeadQuarter: false, IsStockPilling: false, IsStorage: false, IsGeneration: false, IsReception: false, IsTreatment: false, Facilities: [] },
  { Id: 'p2', OwnerId: '2', Name: 'Punto Proveedor', ParentId: '', Address: '', Latitude: '', Longitude: '', LocationId: '', IsDelivery: false, IsDisposal: false, IsHeadQuarter: false, IsStockPilling: false, IsStorage: false, IsGeneration: false, IsReception: false, IsTreatment: false, Facilities: [] },
  { Id: 'p3', OwnerId: '3', Name: 'Punto Empleado', ParentId: '', Address: '', Latitude: '', Longitude: '', LocationId: '', IsDelivery: false, IsDisposal: false, IsHeadQuarter: false, IsStockPilling: false, IsStorage: false, IsGeneration: false, IsReception: false, IsTreatment: false, Facilities: [] }
];

describe('FacilitiesComponent', () => {
  let component: FacilitiesComponent;
  let fixture: ComponentFixture<FacilitiesComponent>;
  let facilityRepositorySpy: jasmine.SpyObj<FacilityRepository>;
  let partyRepositorySpy: jasmine.SpyObj<PartyRepository>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let authorizationRepositorySpy: jasmine.SpyObj<AuthorizationRepository>;

  beforeEach(waitForAsync(() => {
    facilityRepositorySpy = jasmine.createSpyObj('FacilityRepository', ['getAll']);
    partyRepositorySpy = jasmine.createSpyObj('PartyRepository', ['getAll']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    authorizationRepositorySpy = jasmine.createSpyObj('AuthorizationRepository', ['getPermission', 'getPersonId']);

    facilityRepositorySpy.getAll.and.returnValue(Promise.resolve(mockFacilities));
    partyRepositorySpy.getAll.and.returnValue(Promise.resolve(mockParties));
    authorizationRepositorySpy.getPermission.and.returnValue(Promise.resolve(CRUD_OPERATIONS.CREATE));
    authorizationRepositorySpy.getPersonId.and.returnValue(Promise.resolve('1'));

    TestBed.configureTestingModule({
      declarations: [FacilitiesComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: FacilityRepository, useValue: facilityRepositorySpy },
        { provide: PartyRepository, useValue: partyRepositorySpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AuthorizationRepository, useValue: authorizationRepositorySpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FacilitiesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load facilities and parties', async () => {
    component.partyId = '';
    await component.ngOnInit();
    expect(partyRepositorySpy.getAll).toHaveBeenCalled();
    expect(facilityRepositorySpy.getAll).toHaveBeenCalled();
    expect(component.parties.length).toBe(3);
    expect(component.facilities.length).toBe(3);
    expect(component.enableNew).toBeTrue();
  });

  it('should filter by partyId', async () => {
    component.partyId = '1';
    await component.ngOnInit();
    expect(component.parties.length).toBe(1);
    expect(component.facilities.length).toBe(1);
    expect(component.facilities[0].Name).toBe('Punto Cliente');
  });

  it('should filter by partyType CLIENT', async () => {
    component.partyId = '';
    component.partyType = THIRD_PARTY_TYPES.CLIENT;
    await component.ngOnInit();
    expect(component.parties.length).toBe(1);
    expect(component.parties[0].IsClient).toBeTrue();
  });

  it('should filter by partyType SUPPLIER', async () => {
    component.partyId = '';
    component.partyType = THIRD_PARTY_TYPES.SUPPLIER;
    await component.ngOnInit();
    expect(component.parties.length).toBe(1);
    expect(component.parties[0].IsProvider).toBeTrue();
  });

  it('should filter by partyType INTERNAL', async () => {
    component.partyId = '';
    component.partyType = THIRD_PARTY_TYPES.INTERNAL;
    await component.ngOnInit();
    expect(component.parties.length).toBe(1);
    expect(component.parties[0].IsEmployee).toBeTrue();
  });

  it('should filter facilities by owner', async () => {
    component.partyId = '2';
    await component.ngOnInit();
    const filtered = component.filterFacilitiesByOwner('2');
    expect(filtered.length).toBe(1);
    expect(filtered[0].Name).toBe('Punto Proveedor');
  });

  it('should handle input search and filter facilities', async () => {
    await component.ngOnInit();
    const event = { target: { value: 'Cliente' } };
    await component.handleInput(event);
    expect(component.filteredFacilities.length).toBe(1);
    expect(component.filteredFacilities[0].Name).toBe('Punto Cliente');
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
    authorizationRepositorySpy.getPersonId.and.returnValue(Promise.resolve('2'));
    await component.ngOnInit();
    await component.select('p1', '1', 'Cliente 1', 'Punto Cliente');
    expect(component.selectedName).toBe('Cliente 1 - Punto Cliente');
  });

  it('should cancel and dismiss modal with null', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should return only visible parties with facilities', async () => {
    await component.ngOnInit();
    const visibleParties = component.getVisibleParties();
    expect(visibleParties.length).toBe(3);
  });

  it('should filter visible parties when searching', async () => {
    await component.ngOnInit();
    const event = { target: { value: 'Cliente' } };
    await component.handleInput(event);
    const visibleParties = component.getVisibleParties();
    expect(visibleParties.length).toBe(1);
    expect(visibleParties[0].Name).toBe('Cliente 1');
  });

  it('should render template elements', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-header')).toBeTruthy();
    expect(compiled.querySelector('ion-searchbar')).toBeTruthy();
    expect(compiled.querySelector('ion-content')).toBeTruthy();
  });
});

