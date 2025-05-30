import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { TutorialPage } from './tutorial.page';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';

describe('TutorialPage', () => {
  let component: TutorialPage;
  let fixture: ComponentFixture<TutorialPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        TutorialPage
      ],
      providers: [
        { provide: NavController, useValue: navCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with step 1', () => {
    expect(component.step).toBe(1);
  });

  it('should render header with logo', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('ion-header');
    const logo = compiled.querySelector('ion-img');

    expect(header).toBeTruthy();
    expect(logo).toBeTruthy();
    expect(logo.getAttribute('src')).toContain('Gresst.png');
    expect(logo.getAttribute('class')).toContain('logo');
  });

  it('should render step 1 content', () => {
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('ion-item');

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].textContent).toContain('Esta aplicación permite gestionar todo tipo de residuos:');
  });

  it('should render step 2 content when step is 2', () => {
    component.step = 2;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('ion-item');

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].textContent).toContain('Actividades de gestión permitidas:');
  });

  it('should render step 3 content when step is 3', () => {
    component.step = 3;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('ion-item');
    const checkbox = compiled.querySelector('ion-checkbox');

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].textContent).toContain('Módulos:');
    expect(checkbox).toBeTruthy();
    expect(checkbox.textContent).toContain('No volver a mostrar este tutorial');
  });

  it('should increment step when nextStep is called', () => {
    component.nextStep();
    expect(component.step).toBe(2);
  });

  it('should decrement step when previousStep is called', () => {
    component.step = 2;
    component.previousStep();
    expect(component.step).toBe(1);
  });

  it('should not decrement step below 1', () => {
    component.previousStep();
    expect(component.step).toBe(1);
  });

  it('should navigate to home when nextStep is called on step 3', () => {
    component.step = 3;
    component.nextStep();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/home');
  });

  it('should navigate to home when navigateToHome is called', () => {
    component.navigateToHome();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/home');
  });

  it('should render navigation buttons correctly', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('ion-button');

    // Step 1 should only show Next button
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain('Siguiente');

    // Step 2 should show both Previous and Next buttons
    component.step = 2;
    fixture.detectChanges();
    const buttonsStep2 = compiled.querySelectorAll('ion-button');
    expect(buttonsStep2.length).toBe(2);
    expect(buttonsStep2[0].textContent).toContain('Anterior');
    expect(buttonsStep2[1].textContent).toContain('Siguiente');

    // Step 3 should show Previous and Finish buttons
    component.step = 3;
    fixture.detectChanges();
    const buttonsStep3 = compiled.querySelectorAll('ion-button');
    expect(buttonsStep3.length).toBe(2);
    expect(buttonsStep3[0].textContent).toContain('Anterior');
    expect(buttonsStep3[1].textContent).toContain('Terminar');
  });

  it('should render content with correct styling', () => {
    const compiled = fixture.nativeElement;
    const content = compiled.querySelector('ion-content');

    expect(content).toBeTruthy();
    expect(content.getAttribute('fullscreen')).toBe('true');
    expect(content.getAttribute('class')).toContain('custom-center');
  });
});
