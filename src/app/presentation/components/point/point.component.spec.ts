import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { PointComponent } from './point.component';
import { Geolocation } from '@capacitor/geolocation';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';

describe('PointComponent', () => {
  let component: PointComponent;
  let fixture: ComponentFixture<PointComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    TestBed.configureTestingModule({
      declarations: [PointComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PointComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.longitude).toBe('');
    expect(component.latitude).toBe('');
    expect(component.idPropietario).toBeNull();
    expect(component.propietario).toBeNull();
  });

  it('should get geolocation and update coordinates', async () => {
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
    await component.getGeoLocation();
    expect(component.latitude).toBe('4.6097');
    expect(component.longitude).toBe('-74.0817');
  });

  it('should handle error when getting geolocation', async () => {
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.reject('Error'));
    const consoleSpy = spyOn(console, 'error');
    await component.getGeoLocation();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should open modal and select propietario', async () => {
    const modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);
    modalSpy.present.and.returnValue(Promise.resolve());
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: { id: '1', name: 'Propietario Test' } }));
    modalCtrlSpy.create.and.returnValue(Promise.resolve(modalSpy));

    await component.selectPropietario();
    expect(modalCtrlSpy.create).toHaveBeenCalledWith({
      component: StakeholdersComponent,
      componentProps: {}
    });
    expect(modalSpy.present).toHaveBeenCalled();
    expect(component.idPropietario).toBe('1');
    expect(component.propietario).toBe('Propietario Test');
  });

  it('should render template elements', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-header')).toBeTruthy();
    expect(compiled.querySelector('ion-content')).toBeTruthy();
    expect(compiled.querySelector('ion-label')).toBeTruthy();
    expect(compiled.querySelector('ion-button')).toBeTruthy();
    expect(compiled.querySelectorAll('ion-input').length).toBeGreaterThan(0);
  });
});
