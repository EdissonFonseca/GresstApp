import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LocationComponent } from './location.component';

describe('LocationComponent', () => {
  let component: LocationComponent;
  let fixture: ComponentFixture<LocationComponent>;

  const mockMarker = {
    title: 'Test Location',
    snippet: 'Test Description',
    latitude: 4.6097,
    longitude: -74.0817
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LocationComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with undefined marker', () => {
    fixture.detectChanges();
    expect(component.marker).toBeUndefined();
  });

  it('should render marker title in header', () => {
    component.marker = mockMarker;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    expect(title.textContent).toContain(mockMarker.title);
  });

  it('should render marker snippet', () => {
    component.marker = mockMarker;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const snippet = compiled.querySelector('ion-label');
    expect(snippet.textContent).toContain(mockMarker.snippet);
  });

  it('should render location icon', () => {
    component.marker = mockMarker;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('ion-icon');
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('name')).toBe('location');
  });

  it('should render coordinates', () => {
    component.marker = mockMarker;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const content = compiled.querySelector('ion-content');
    expect(content.textContent).toContain(`lat: ${mockMarker.latitude}`);
    expect(content.textContent).toContain(`long: ${mockMarker.longitude}`);
  });

  it('should handle undefined marker properties', () => {
    component.marker = {};
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    const snippet = compiled.querySelector('ion-label');
    const content = compiled.querySelector('ion-content');

    expect(title.textContent).toBe('');
    expect(snippet.textContent).toBe('');
    expect(content.textContent).toContain('lat: undefined - long: undefined');
  });

  it('should handle null marker', () => {
    component.marker = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    const snippet = compiled.querySelector('ion-label');
    const content = compiled.querySelector('ion-content');

    expect(title.textContent).toBe('');
    expect(snippet.textContent).toBe('');
    expect(content.textContent).toContain('lat: undefined - long: undefined');
  });

  it('should update when marker changes', () => {
    component.marker = mockMarker;
    fixture.detectChanges();

    const newMarker = {
      title: 'New Location',
      snippet: 'New Description',
      latitude: 4.6105,
      longitude: -74.0824
    };

    component.marker = newMarker;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    const snippet = compiled.querySelector('ion-label');
    const content = compiled.querySelector('ion-content');

    expect(title.textContent).toContain(newMarker.title);
    expect(snippet.textContent).toContain(newMarker.snippet);
    expect(content.textContent).toContain(`lat: ${newMarker.latitude}`);
    expect(content.textContent).toContain(`long: ${newMarker.longitude}`);
  });
});
