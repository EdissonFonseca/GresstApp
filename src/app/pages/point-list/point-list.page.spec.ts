import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PointListPage } from './point-list.page';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ComponentsModule } from 'src/app/components/components.module';

describe('PointListPage', () => {
  let component: PointListPage;
  let fixture: ComponentFixture<PointListPage>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;

  beforeEach(async () => {
    paramMapSpy = jasmine.createSpyObj('ParamMap', ['get', 'has', 'getAll', 'keys']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy
      }
    });

    await TestBed.configureTestingModule({
      declarations: [PointListPage],
      imports: [IonicModule.forRoot(), ComponentsModule],
      providers: [
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PointListPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty idTercero when no route param', () => {
    paramMapSpy.get.and.returnValue(null);
    component.ngOnInit();
    expect(component.idTercero).toBe('');
  });

  it('should initialize with idTercero from route param', () => {
    const mockIdTercero = '123';
    paramMapSpy.get.and.returnValue(mockIdTercero);
    component.ngOnInit();
    expect(component.idTercero).toBe(mockIdTercero);
  });

  it('should render header with back button', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('ion-header');
    expect(header).toBeTruthy();
    const backButton = header.querySelector('ion-back-button');
    expect(backButton).toBeTruthy();
  });

  it('should render header with title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('ion-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Ruta');
  });

  it('should render points component with idTercero', () => {
    const mockIdTercero = '123';
    paramMapSpy.get.and.returnValue(mockIdTercero);
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const pointsComponent = compiled.querySelector('app-points');
    expect(pointsComponent).toBeTruthy();
    expect(pointsComponent.getAttribute('idTercero')).toBe(mockIdTercero);
  });
});