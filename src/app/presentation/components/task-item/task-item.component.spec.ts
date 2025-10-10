import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TaskItemComponent } from './task-item.component';
import { Task } from '@app/domain/entities/task.entity';
import { STATUS } from '@app/core/constants';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  const mockTask: Task = {
    TaskId: '1',
    ProcessId: '1',
    SubprocessId: '1',
    MaterialId: '1',
    ResidueId: '1',
    ResourceId: '1',
    ServiceId: '1',
    InputOutput: 'I',
    Quantity: 10,
    Weight: 20,
    Volume: 30,
    PackagingId: '1',
    PointId: '1',
    DestinationPointId: '2',
    ThirdPartyId: '1',
    DestinationThirdPartyId: '2',
    StatusId: STATUS.PENDING,
    ExecutionDate: new Date().toISOString(),
    Photos: [],
    Observations: 'Test observations',
    Material: 'Test Material',
    Request: 'Test Request'
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
    component.tarea = { ...mockTask, Request: undefined };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p')).toBeNull();
  });
});
