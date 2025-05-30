import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialListPage } from './material-list.page';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialsComponent } from '@app/components/materials/materials.component';

describe('MaterialListPage', () => {
  let component: MaterialListPage;
  let fixture: ComponentFixture<MaterialListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        IonicModule.forRoot(),
        FormsModule,
        MaterialsComponent
      ],
      declarations: [MaterialListPage]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle refresh event', () => {
    const mockEvent = {
      target: {
        complete: jasmine.createSpy('complete')
      }
    };

    component.refresh(mockEvent);
    expect(mockEvent.target.complete).toHaveBeenCalled();
  });

  it('should handle material selection', () => {
    const mockMaterial = {
      id: '1',
      name: 'Test Material',
      capture: 'Cantidad',
      measure: 'Peso',
      factor: 1
    };

    spyOn(console, 'log');
    component.onMaterialSelected(mockMaterial);
    expect(console.log).toHaveBeenCalledWith('Material seleccionado:', mockMaterial);
  });

  it('should handle add material', () => {
    spyOn(console, 'log');
    component.addMaterial();
    expect(console.log).toHaveBeenCalledWith('Agregar nuevo material');
  });

  it('should render materials component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-materials')).toBeTruthy();
  });

  it('should render add button', () => {
    const compiled = fixture.nativeElement;
    const addButton = compiled.querySelector('ion-fab-button');
    expect(addButton).toBeTruthy();
    expect(addButton.querySelector('ion-icon').getAttribute('name')).toBe('add');
  });

  it('should render refresher', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-refresher')).toBeTruthy();
  });

  it('should render header with title', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('ion-header');
    expect(header).toBeTruthy();
    expect(header.querySelector('ion-title').textContent).toBe('Materiales');
  });
});