import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ServiceListPage } from './service-list.page';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';

describe('ServiceListPage', () => {
  let component: ServiceListPage;
  let fixture: ComponentFixture<ServiceListPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        ServiceListPage
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header with back button and title', () => {
    const compiled = fixture.nativeElement;
    const backButton = compiled.querySelector('ion-back-button');
    const title = compiled.querySelector('ion-title');

    expect(backButton).toBeTruthy();
    expect(title.textContent).toContain('Servicios');
  });

  it('should render service selection label', () => {
    const compiled = fixture.nativeElement;
    const label = compiled.querySelector('ion-label');

    expect(label).toBeTruthy();
    expect(label.textContent).toContain('Seleccione los servicios que realiza');
  });

  it('should render services component with showHeader set to false', () => {
    const compiled = fixture.nativeElement;
    const servicesComponent = compiled.querySelector('app-services');

    expect(servicesComponent).toBeTruthy();
    expect(servicesComponent.getAttribute('showHeader')).toBe('false');
  });

  it('should have correct padding in content', () => {
    const compiled = fixture.nativeElement;
    const content = compiled.querySelector('ion-content');

    expect(content).toBeTruthy();
    expect(content.getAttribute('style')).toContain('--padding-top: 16px');
    expect(content.getAttribute('style')).toContain('--padding-bottom: 16px');
  });
});