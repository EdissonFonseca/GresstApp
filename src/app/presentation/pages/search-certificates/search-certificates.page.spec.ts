import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { SearchCertificatesPage } from './search-certificates.page';
import { OperationsApiService } from '@app/infrastructure/repositories/api/operationsApi.repository';
import { StorageService } from '@app/infrastructure/repositories/api/storage.repository';
import { STORAGE } from '@app/core/constants';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

describe('SearchCertificatesPage', () => {
  let component: SearchCertificatesPage;
  let fixture: ComponentFixture<SearchCertificatesPage>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let operationsServiceSpy: jasmine.SpyObj<OperationsApiService>;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    operationsServiceSpy = jasmine.createSpyObj('OperationsApiService', ['emitCertificate']);
    storageSpy = jasmine.createSpyObj('StorageService', ['get']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        SearchCertificatesPage
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
        { provide: OperationsApiService, useValue: operationsServiceSpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchCertificatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.certificateType).toBe('');
    expect(component.selectedDate).toBeUndefined();
  });

  it('should update certificate type when selected', () => {
    const mockType = 'Acopio';
    component.onCertificateTypeChange(mockType);
    expect(component.certificateType).toBe(mockType);
  });

  it('should update date when selected', () => {
    const mockDate = new Date('2024-03-20');
    component.onDateChange(mockDate);
    expect(component.selectedDate).toEqual(mockDate);
  });

  it('should show error toast when searching without certificate type', fakeAsync(async () => {
    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    component.certificateType = '';
    await component.buscar();
    tick();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Por favor seleccione un tipo de certificado',
      duration: 3000,
      position: 'middle',
      color: 'dark'
    });
    expect(mockToast.present).toHaveBeenCalled();
  }));

  it('should show error toast when searching without date', fakeAsync(async () => {
    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    component.certificateType = 'Acopio';
    component.selectedDate = undefined;
    await component.buscar();
    tick();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Por favor seleccione una fecha',
      duration: 3000,
      position: 'middle',
      color: 'dark'
    });
    expect(mockToast.present).toHaveBeenCalled();
  }));

  it('should emit certificate when search is successful', fakeAsync(async () => {
    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    const mockTransaction = {
      IdTransaccion: '123',
      Tipo: 'Acopio',
      IdProceso: '1',
      EntradaSalida: 'E',
      IdEstado: 'P',
      IdRecurso: '1',
      IdServicio: 'T',
      Titulo: 'Test Transaction'
    };
    storageSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    operationsServiceSpy.emitCertificate.and.returnValue(Promise.resolve(true));

    component.certificateType = 'Acopio';
    component.selectedDate = new Date('2024-03-20');
    await component.buscar();
    tick();

    expect(storageSpy.get).toHaveBeenCalledWith(STORAGE.TRANSACTION);
    expect(operationsServiceSpy.emitCertificate).toHaveBeenCalledWith(mockTransaction);
    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Certificado emitido exitosamente',
      duration: 3000,
      position: 'middle',
      color: 'success'
    });
    expect(mockToast.present).toHaveBeenCalled();
  }));

  it('should handle error when emitting certificate fails', fakeAsync(async () => {
    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    const mockTransaction = {
      IdTransaccion: '123',
      Tipo: 'Acopio',
      IdProceso: '1',
      EntradaSalida: 'E',
      IdEstado: 'P',
      IdRecurso: '1',
      IdServicio: 'T',
      Titulo: 'Test Transaction'
    };
    storageSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    operationsServiceSpy.emitCertificate.and.returnValue(Promise.reject(new Error('Failed to emit certificate')));

    component.certificateType = 'Acopio';
    component.selectedDate = new Date('2024-03-20');
    await component.buscar();
    tick();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Error al emitir el certificado',
      duration: 3000,
      position: 'middle',
      color: 'danger'
    });
    expect(mockToast.present).toHaveBeenCalled();
  }));

  it('should handle error when storage get fails', fakeAsync(async () => {
    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    storageSpy.get.and.returnValue(Promise.reject(new Error('Storage error')));

    component.certificateType = 'Acopio';
    component.selectedDate = new Date('2024-03-20');
    await component.buscar();
    tick();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Error al emitir el certificado',
      duration: 3000,
      position: 'middle',
      color: 'danger'
    });
    expect(mockToast.present).toHaveBeenCalled();
  }));

  it('should handle error when emitCertificate returns false', fakeAsync(async () => {
    const mockToast = {
      present: jasmine.createSpy('present')
    };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast as any));

    const mockTransaction = {
      IdTransaccion: '123',
      Tipo: 'Acopio',
      IdProceso: '1',
      EntradaSalida: 'E',
      IdEstado: 'P',
      IdRecurso: '1',
      IdServicio: 'T',
      Titulo: 'Test Transaction'
    };
    storageSpy.get.and.returnValue(Promise.resolve(mockTransaction));
    operationsServiceSpy.emitCertificate.and.returnValue(Promise.resolve(false));

    component.certificateType = 'Acopio';
    component.selectedDate = new Date('2024-03-20');
    await component.buscar();
    tick();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Error al emitir el certificado',
      duration: 3000,
      position: 'middle',
      color: 'danger'
    });
    expect(mockToast.present).toHaveBeenCalled();
  }));

  it('should handle different certificate types', () => {
    const types = ['Acopio', 'Almacenamiento', 'Disposicion', 'Generacion', 'Entrega',
                  'Manifiesto de carga', 'Recepcion', 'RH', 'Transporte', 'Tratamiento'];

    types.forEach(type => {
      component.onCertificateTypeChange(type);
      expect(component.certificateType).toBe(type);
    });
  });

  it('should render header with back button and title', () => {
    const compiled = fixture.nativeElement;
    const backButton = compiled.querySelector('ion-back-button');
    const title = compiled.querySelector('ion-title');

    expect(backButton).toBeTruthy();
    expect(title.textContent).toContain('Descargar certificado');
  });

  it('should render certificate type select with all options', () => {
    const compiled = fixture.nativeElement;
    const select = compiled.querySelector('ion-select');
    const options = compiled.querySelectorAll('ion-select-option');

    expect(select).toBeTruthy();
    expect(options.length).toBe(10);
    expect(options[0].textContent).toContain('Acopio');
    expect(options[9].textContent).toContain('Tratamiento');
  });

  it('should render date picker', () => {
    const compiled = fixture.nativeElement;
    const dateButton = compiled.querySelector('ion-datetime-button');
    const datetime = compiled.querySelector('ion-datetime');

    expect(dateButton).toBeTruthy();
    expect(datetime).toBeTruthy();
    expect(datetime.getAttribute('presentation')).toBe('date');
  });

  it('should render search button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button');

    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Buscar');
  });
});
