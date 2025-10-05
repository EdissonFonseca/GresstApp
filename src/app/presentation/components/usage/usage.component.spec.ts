import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { UsageComponent } from './usage.component';
import { Utils } from '@app/utils/utils';

describe('UsageComponent', () => {
  let component: UsageComponent;
  let fixture: ComponentFixture<UsageComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [UsageComponent],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.title).toBe('');
    expect(component.actividad).toBeUndefined();
    expect(component.frmConsumo.get('Insumo')?.value).toBe('');
    expect(component.frmConsumo.get('Cantidad')?.value).toBeNull();
    expect(component.frmConsumo.get('Precio')?.value).toBeNull();
  });

  it('should get state color using Utils', () => {
    const mockStateId = 'test-state';
    const mockColor = 'success';
    spyOn(Utils, 'getStateColor').and.returnValue(mockColor);

    const result = component.getStateColor(mockStateId);

    expect(Utils.getStateColor).toHaveBeenCalledWith(mockStateId);
    expect(result).toBe(mockColor);
  });

  it('should dismiss modal with null when canceling', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null);
  });

  it('should not dismiss modal when form is invalid', () => {
    component.frmConsumo.setValue({
      Insumo: '',
      Cantidad: null,
      Precio: null
    });

    component.confirm();

    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should dismiss modal with form data when confirming with valid form', fakeAsync(() => {
    const mockFormData = {
      Insumo: 'Test Insumo',
      Cantidad: 10,
      Precio: 100
    };

    component.frmConsumo.setValue(mockFormData);
    component.confirm();
    tick();

    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(mockFormData);
  }));

  it('should update form values correctly', () => {
    const testData = {
      Insumo: 'Test Insumo',
      Cantidad: 5,
      Precio: 50
    };

    component.frmConsumo.patchValue(testData);

    expect(component.frmConsumo.get('Insumo')?.value).toBe(testData.Insumo);
    expect(component.frmConsumo.get('Cantidad')?.value).toBe(testData.Cantidad);
    expect(component.frmConsumo.get('Precio')?.value).toBe(testData.Precio);
  });

  it('should validate form controls', () => {
    const form = component.frmConsumo;

    // Test empty form
    expect(form.valid).toBeFalsy();

    // Test with valid data
    form.setValue({
      Insumo: 'Test Insumo',
      Cantidad: 10,
      Precio: 100
    });
    expect(form.valid).toBeTruthy();
  });

  it('should handle negative values in form', () => {
    const form = component.frmConsumo;

    form.setValue({
      Insumo: 'Test Insumo',
      Cantidad: -10,
      Precio: -100
    });

    component.confirm();
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should handle zero values in form', () => {
    const form = component.frmConsumo;

    form.setValue({
      Insumo: 'Test Insumo',
      Cantidad: 0,
      Precio: 0
    });

    component.confirm();
    expect(modalCtrlSpy.dismiss).not.toHaveBeenCalled();
  });

  it('should handle decimal values in form', () => {
    const form = component.frmConsumo;

    form.setValue({
      Insumo: 'Test Insumo',
      Cantidad: 10.5,
      Precio: 100.75
    });

    component.confirm();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      Insumo: 'Test Insumo',
      Cantidad: 10.5,
      Precio: 100.75
    });
  });

  it('should handle special characters in input field', () => {
    const form = component.frmConsumo;

    form.setValue({
      Insumo: 'Test Insumo #123',
      Cantidad: 10,
      Precio: 100
    });

    component.confirm();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith({
      Insumo: 'Test Insumo #123',
      Cantidad: 10,
      Precio: 100
    });
  });
});
