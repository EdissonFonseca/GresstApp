import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { BankPage } from './bank.page';
import { InventoryApiService } from '@app/services/api/inventoryApi.service';
import { StorageService } from '@app/services/core/storage.service';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { Banco } from 'src/app/interfaces/banco.interface';
import { Utils } from '@app/utils/utils';

describe('BankPage', () => {
  let component: BankPage;
  let fixture: ComponentFixture<BankPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryApiService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationApiService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;

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
    userNotificationServiceSpy = jasmine.createSpyObj('UserNotificationService', [
      'showLoading',
      'hideLoading',
      'showToast'
    ]);

    spyOn(Utils, 'getImage').and.returnValue('test-image-url');

    await TestBed.configureTestingModule({
      declarations: [BankPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: InventoryApiService, useValue: inventoryServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: AuthenticationApiService, useValue: authServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy }
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

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(component.materiales).toEqual(mockMaterials);
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle error when loading materials', fakeAsync(() => {
    inventoryServiceSpy.getBank.and.returnValue(Promise.reject('Error'));

    component.ngOnInit();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(component.materiales).toEqual([]);
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

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(component.materiales).toEqual(mockMaterials.filter(m => m.Nombre.toLowerCase().includes('test')));
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle error when filtering materials', fakeAsync(() => {
    inventoryServiceSpy.getBank.and.returnValue(Promise.reject('Error'));

    const event = { target: { value: 'test' } };
    component.handleInput(event);
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(component.materiales).toEqual([]);
  }));

  it('should handle clear input', fakeAsync(() => {
    const mockMaterials = [mockMaterial];
    inventoryServiceSpy.getBank.and.returnValue(Promise.resolve(mockMaterials));

    component.handleClear();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(component.materiales).toEqual(mockMaterials);
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle error when clearing input', fakeAsync(() => {
    inventoryServiceSpy.getBank.and.returnValue(Promise.reject('Error'));

    component.handleClear();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(inventoryServiceSpy.getBank).toHaveBeenCalled();
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
    expect(component.materiales).toEqual([]);
  }));
});
