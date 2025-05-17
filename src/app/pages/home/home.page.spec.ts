import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { ComponentsModule } from '@app/components/components.module';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from '@app/services/core/storage.service';
import { GlobalesService } from '@app/services/globales.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let synchronizationServiceSpy: jasmine.SpyObj<SynchronizationService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let globalesServiceSpy: jasmine.SpyObj<GlobalesService>;

  beforeEach(async () => {
    const syncSpy = jasmine.createSpyObj('SynchronizationService', ['countPendingTransactions', 'pendingTransactions']);
    const storageSpy = jasmine.createSpyObj('StorageService', ['get']);
    const globalesSpy = jasmine.createSpyObj('GlobalesService', ['presentToast']);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [
        IonicModule.forRoot(),
        ComponentsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SynchronizationService, useValue: syncSpy },
        { provide: StorageService, useValue: storageSpy },
        { provide: GlobalesService, useValue: globalesSpy }
      ]
    }).compileComponents();

    synchronizationServiceSpy = TestBed.inject(SynchronizationService) as jasmine.SpyObj<SynchronizationService>;
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    globalesServiceSpy = TestBed.inject(GlobalesService) as jasmine.SpyObj<GlobalesService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.title).toBe('Jornada');
    expect(component.helpPopup).toBe('help-inventario');
    expect(component.currentTab()).toBe('actividades');
  });

  it('should count pending transactions on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(synchronizationServiceSpy.countPendingTransactions).toHaveBeenCalled();
  }));

  it('should load user data on init', fakeAsync(() => {
    const mockUser = { Nombre: 'Test User' };
    storageServiceSpy.get.and.returnValue(Promise.resolve(mockUser));

    component.ngOnInit();
    tick();

    expect(storageServiceSpy.get).toHaveBeenCalledWith('User');
    expect(component.nombreUsuario()).toBe('Test User');
  }));

  it('should load account data on init', fakeAsync(() => {
    const mockCuenta = { NombreCuenta: 'Test Account' };
    storageServiceSpy.get.and.returnValue(Promise.resolve(mockCuenta));

    component.ngOnInit();
    tick();

    expect(storageServiceSpy.get).toHaveBeenCalledWith('Cuenta');
    expect(component.nombreCuenta()).toBe('Test Account');
  }));

  it('should handle errors during initialization', fakeAsync(() => {
    storageServiceSpy.get.and.returnValue(Promise.reject('Error'));

    component.ngOnInit();
    tick();

    expect(globalesServiceSpy.presentToast).toHaveBeenCalledWith(
      'Error al cargar los datos. Por favor, intente de nuevo.',
      'middle'
    );
  }));

  it('should update header title and help popup', () => {
    component.setHeader('New Title', 'new-help');
    expect(component.title).toBe('New Title');
    expect(component.helpPopup).toBe('new-help');
  });

  it('should handle tab changes', () => {
    const mockEvent = { tab: 'inventario' };
    component.onTabChange(mockEvent);
    expect(component.currentTab()).toBe('inventario');
  });

  it('should get sync status', () => {
    const mockPendingTransactions = 5;
    synchronizationServiceSpy.pendingTransactions.and.returnValue(mockPendingTransactions);

    expect(component.syncStatus).toBe(mockPendingTransactions);
    expect(synchronizationServiceSpy.pendingTransactions).toHaveBeenCalled();
  });

  it('should handle tab selection in setHeader', () => {
    const mockTabs = {
      getSelected: () => 'inventario'
    };
    component.tabs = mockTabs as any;

    component.setHeader('New Title', 'new-help');
    expect(component.currentTab()).toBe('inventario');
  });

  describe('tabs integration', () => {
    it('should have tabs component initialized', () => {
      expect(component.tabs).toBeTruthy();
    });

    it('should have correct tab buttons', () => {
      const tabButtons = fixture.debugElement.nativeElement.querySelectorAll('ion-tab-button');
      expect(tabButtons.length).toBe(2);
      expect(tabButtons[0].textContent).toContain('Jornada');
      expect(tabButtons[1].textContent).toContain('Inventario');
    });
  });
});
