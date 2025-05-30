import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TaskItemComponent } from './task-item.component';
import { Tarea } from '@app/interfaces/tarea.interface';
import { STATUS } from '@app/constants/constants';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  const mockTask: Tarea = {
    IdTarea: '1',
    IdActividad: '1',
    IdTransaccion: '1',
    IdMaterial: '1',
    IdResiduo: '1',
    IdRecurso: '1',
    IdServicio: '1',
    EntradaSalida: 'I',
    Cantidad: 10,
    Peso: 20,
    Volumen: 30,
    IdEmbalaje: '1',
    IdDeposito: '1',
    IdDepositoDestino: '2',
    IdTercero: '1',
    IdTerceroDestino: '2',
    IdEstado: STATUS.PENDING,
    FechaEjecucion: new Date().toISOString(),
    Fotos: [],
    Observaciones: 'Test observations',
    Material: 'Test Material',
    Solicitud: 'Test Request'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TaskItemComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    component.tarea = mockTask;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showEdit).toBeFalse();
  });

  it('should display task material', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('Test Material');
  });

  it('should display task request when available', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p').textContent).toContain('Test Request');
  });

  it('should not show edit button by default', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-button')).toBeNull();
  });

  it('should show edit button when showEdit is true', () => {
    component.showEdit = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const editButton = compiled.querySelector('ion-button');
    expect(editButton).toBeTruthy();
    expect(editButton.getAttribute('color')).toBe('warning');
  });

  it('should emit edit event when edit button is clicked', () => {
    component.showEdit = true;
    fixture.detectChanges();

    spyOn(component.edit, 'emit');
    const compiled = fixture.nativeElement;
    const editButton = compiled.querySelector('ion-button');
    editButton.click();

    expect(component.edit.emit).toHaveBeenCalledWith('1');
  });

  it('should not display request when not available', () => {
    component.tarea = { ...mockTask, Solicitud: undefined };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p')).toBeNull();
  });
});
