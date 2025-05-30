import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TreatmentListPage } from './treatment-list.page';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreatmentsComponent } from '@app/components/treatments/treatments.component';
import { TreatmentsService } from '@app/services/masterdata/treatments.service';
import { Tratamiento } from '@app/interfaces/tratamiento.interface';

describe('TreatmentListPage', () => {
  let component: TreatmentListPage;
  let fixture: ComponentFixture<TreatmentListPage>;
  let treatmentsServiceSpy: jasmine.SpyObj<TreatmentsService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockTreatments: Tratamiento[] = [
    {
      IdTratamiento: '1',
      Nombre: 'Test Treatment 1',
      Descripcion: 'Description 1',
      IdServicio: '1'
    },
    {
      IdTratamiento: '2',
      Nombre: 'Test Treatment 2',
      Descripcion: 'Description 2',
      IdServicio: '2'
    }
  ];

  beforeEach(waitForAsync(() => {
    treatmentsServiceSpy = jasmine.createSpyObj('TreatmentsService', ['list']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        TranslateModule.forRoot(),
        TreatmentListPage
      ],
      providers: [
        { provide: TreatmentsService, useValue: treatmentsServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize successfully', () => {
    expect(component).toBeDefined();
    expect(fixture).toBeDefined();
  });

  it('should render header with back button and title', () => {
    const compiled = fixture.nativeElement;
    const backButton = compiled.querySelector('ion-back-button');
    const title = compiled.querySelector('ion-title');

    expect(backButton).toBeTruthy();
    expect(title).toBeTruthy();
    expect(backButton.getAttribute('text')).toBe('COMMON.BACK | translate');
    expect(title.textContent).toBe('TREATMENTS.TITLE | translate');
  });

  it('should render treatments component', () => {
    const compiled = fixture.nativeElement;
    const treatmentsElement = compiled.querySelector('app-treatments');
    expect(treatmentsElement).toBeTruthy();
  });

  it('should pass showHeader as false to treatments component', () => {
    const compiled = fixture.nativeElement;
    const treatmentsElement = compiled.querySelector('app-treatments');
    expect(treatmentsElement.getAttribute('showHeader')).toBe('false');
  });

  it('should render content with correct padding', () => {
    const compiled = fixture.nativeElement;
    const content = compiled.querySelector('ion-content');
    expect(content).toBeTruthy();
    expect(content.getAttribute('style')).toContain('--padding-top: 16px');
    expect(content.getAttribute('style')).toContain('--padding-bottom: 16px');
  });

  it('should render treatments component with full width and height', () => {
    const compiled = fixture.nativeElement;
    const treatmentsElement = compiled.querySelector('app-treatments');
    expect(treatmentsElement.getAttribute('style')).toContain('width: 100%');
    expect(treatmentsElement.getAttribute('style')).toContain('height: 100%');
  });

  it('should load treatments on initialization', async () => {
    treatmentsServiceSpy.list.and.returnValue(Promise.resolve(mockTreatments));
    await component.ngOnInit();
    expect(treatmentsServiceSpy.list).toHaveBeenCalled();
  });

  it('should handle error when loading treatments', async () => {
    const error = new Error('Failed to load treatments');
    treatmentsServiceSpy.list.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    await component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Error loading treatments:', error);
  });

  it('should translate back button text', () => {
    translateServiceSpy.instant.and.returnValue('Back');
    const compiled = fixture.nativeElement;
    const backButton = compiled.querySelector('ion-back-button');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('COMMON.BACK');
  });

  it('should translate title text', () => {
    translateServiceSpy.instant.and.returnValue('Treatments');
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('TREATMENTS.TITLE');
  });
});