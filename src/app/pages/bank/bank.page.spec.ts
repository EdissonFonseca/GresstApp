import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { BankPage } from './bank.page';
import { InventoryApiService } from '@app/services/api/inventoryApi.service';
import { StorageService } from '@app/services/core/storage.service';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { Utils } from '@app/utils/utils';
import { Banco } from 'src/app/interfaces/banco.interface';

describe('BankPage', () => {
  let component: BankPage;
  let fixture: ComponentFixture<BankPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryApiService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;

  const mockMaterial: Banco = {
    IdMaterial: '123',
    IdResiduo: '456',
    IdEstado: 'PENDING',
    Nombre: 'Test Material',
    Propietario: 'Test Owner',
    Deposito: 'Test Deposit',
    Cantidad: 100
  };

  beforeEach(async () => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    inventoryServiceSpy = jasmine.createSpyObj('InventoryApiService', ['getBank']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['get']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationApiService', ['login']);

    spyOn(Utils, 'showLoading');
    spyOn(Utils, 'hideLoading');
    spyOn(Utils, 'getImage').and.returnValue('test-image-url');

    await TestBed.configureTestingModule({
      declarations: [BankPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: InventoryApiService, useValue: inventoryServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: AuthenticationApiService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BankPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load materials on init', fakeAsync(() => {
    const mockMaterials = [mockMaterial];
    inventoryServiceSpy.getBank.and.returnValue(Promise.resolve(mockMaterials));

    component.ngOnInit();
    tick();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(component.materiales).toEqual(mockMaterials);
    expect(Utils.hideLoading).toHaveBeenCalled();
  }));

  it('should get image for material', () => {
    const imageUrl = component.getImagen('123');
    expect(Utils.getImage).toHaveBeenCalledWith('123');
    expect(imageUrl).toBe('test-image-url');
  });

  it('should redirect to interlocutors', () => {
    component.redirectToInterlocutores('123');
    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/chat-interlocutors', {
      queryParams: { IdResiduo: '123' }
    });
  });

  it('should filter materials on search input', fakeAsync(() => {
    const mockMaterials = [mockMaterial];
    inventoryServiceSpy.getBank.and.returnValue(Promise.resolve(mockMaterials));

    const event = { target: { value: 'test' } };
    component.handleInput(event);
    tick();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(component.materiales).toEqual(mockMaterials.filter(m => m.Nombre.toLowerCase().includes('test')));
    expect(Utils.hideLoading).toHaveBeenCalled();
  }));

  it('should handle clear and refresh data', fakeAsync(() => {
    const mockMaterials = [mockMaterial];

    storageServiceSpy.get.and.returnValue(Promise.resolve('test-credentials'));
    authServiceSpy.login.and.returnValue(Promise.resolve(true));
    inventoryServiceSpy.getBank.and.returnValue(Promise.resolve(mockMaterials));

    component.handleClear();
    tick();

    expect(Utils.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(storageServiceSpy.get).toHaveBeenCalledWith('Login');
    expect(storageServiceSpy.get).toHaveBeenCalledWith('Password');
    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(component.materiales).toEqual(mockMaterials);
    expect(Utils.hideLoading).toHaveBeenCalled();
  }));
});
