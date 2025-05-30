import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { SignPadComponent } from './sign-pad.component';
import { ElementRef } from '@angular/core';

describe('SignPadComponent', () => {
  let component: SignPadComponent;
  let fixture: ComponentFixture<SignPadComponent>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [SignPadComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignPadComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showName).toBeTrue();
    expect(component.showPin).toBeTrue();
    expect(component.showNotes).toBeTrue();
  });

  it('should initialize signature pad on view enter', () => {
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    component.signatureCanvas = { nativeElement: mockCanvas } as ElementRef;

    component.ionViewDidEnter();

    expect(component['canvas']).toBeTruthy();
    expect(component['ctx']).toBeTruthy();
  });

  it('should handle signature drawing', () => {
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    component.signatureCanvas = { nativeElement: mockCanvas } as ElementRef;
    component.ionViewDidEnter();

    const mockEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
      preventDefault: () => {}
    };

    component.startDrawing(mockEvent);
    expect(component['drawing']).toBeTrue();

    component.draw(mockEvent);
    expect(component['ctx'].lineTo).toHaveBeenCalled();

    component.endDrawing();
    expect(component['drawing']).toBeFalse();
  });

  it('should clear signature', () => {
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    component.signatureCanvas = { nativeElement: mockCanvas } as ElementRef;
    component.ionViewDidEnter();

    component.clear();
    expect(component['ctx'].clearRect).toHaveBeenCalled();
  });

  it('should cancel and dismiss modal', () => {
    component.cancel();
    expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should confirm and get signature data', () => {
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    component.signatureCanvas = { nativeElement: mockCanvas } as ElementRef;
    component.ionViewDidEnter();

    // Mock canvas.toDataURL
    spyOn(mockCanvas, 'toDataURL').and.returnValue('data:image/png;base64,mockData');

    component.confirm();
    expect(mockCanvas.toDataURL).toHaveBeenCalled();
  });
});
