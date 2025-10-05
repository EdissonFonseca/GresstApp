import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LocationSelectComponent } from './location-select.component';
import { Geolocation } from '@capacitor/geolocation';

describe('LocationSelectComponent', () => {
  let component: LocationSelectComponent;
  let fixture: ComponentFixture<LocationSelectComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);

    TestBed.configureTestingModule({
      declarations: [LocationSelectComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationSelectComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.description).toBe('');
    expect(component.latitude).toBeNull();
    expect(component.longitude).toBeNull();
    expect(component.isLoading).toBeFalse();
  });

  it('should render description input', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('ion-input');
    expect(input).toBeTruthy();
    expect(input.getAttribute('placeholder')).toBe('Ingrese una descripción');
  });

  it('should render get location button', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('ion-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Obtener ubicación actual');
  });

  it('should render confirm button', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('ion-button');
    const confirmButton = buttons[1];
    expect(confirmButton).toBeTruthy();
    expect(confirmButton.textContent).toContain('Confirmar ubicación');
    expect(confirmButton.disabled).toBeTrue();
  });

  it('should show loading state when getting location', async () => {
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.resolve({
      coords: {
        latitude: 4.6097,
        longitude: -74.0817,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    }));

    await component.getLocation();
    expect(component.isLoading).toBeFalse();
    expect(component.latitude).toBe(4.6097);
    expect(component.longitude).toBe(-74.0817);
  });

  it('should handle geolocation permission denied error', async () => {
    const mockError = {
      code: 1,
      message: 'User denied Geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    };
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.reject(mockError));

    const toastSpy = spyOn(component as any, 'showToast');
    await component.getLocation();

    expect(toastSpy).toHaveBeenCalledWith('Permiso de ubicación denegado', 'danger');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle geolocation position unavailable error', async () => {
    const mockError = {
      code: 2,
      message: 'Position unavailable',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    };
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.reject(mockError));

    const toastSpy = spyOn(component as any, 'showToast');
    await component.getLocation();

    expect(toastSpy).toHaveBeenCalledWith('Información de ubicación no disponible', 'danger');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle geolocation timeout error', async () => {
    const mockError = {
      code: 3,
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    };
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.reject(mockError));

    const toastSpy = spyOn(component as any, 'showToast');
    await component.getLocation();

    expect(toastSpy).toHaveBeenCalledWith('Tiempo de espera agotado al obtener la ubicación', 'danger');
    expect(component.isLoading).toBeFalse();
  });

  it('should show warning toast when confirming without location', () => {
    const toastSpy = spyOn(component as any, 'showToast');
    component.confirm();
    expect(toastSpy).toHaveBeenCalledWith('Por favor, obtén una ubicación primero', 'warning');
  });

  it('should dismiss modal with location data when confirming with valid location', () => {
    component.description = 'Test Location';
    component.latitude = 4.6097;
    component.longitude = -74.0817;

    component.confirm();

    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      description: 'Test Location',
      latitude: 4.6097,
      longitude: -74.0817
    }, 'confirm');
  });

  it('should dismiss modal with null when canceling', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should show success toast when location is obtained', async () => {
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.resolve({
      coords: {
        latitude: 4.6097,
        longitude: -74.0817,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    }));

    const toastSpy = spyOn(component as any, 'showToast');
    await component.getLocation();

    expect(toastSpy).toHaveBeenCalledWith('Ubicación obtenida exitosamente', 'success');
  });
});
