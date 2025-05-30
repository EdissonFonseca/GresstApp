import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CardComponent } from './card.component';
import { Card } from '@app/interfaces/card.interface';
import { STATUS } from '@app/constants/constants';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  const mockCard: Card = {
    id: '1',
    title: 'Test Card',
    status: STATUS.PENDING,
    type: 'activity',
    color: '#FFF8E1',
    actionName: 'Test Action',
    description: 'Test Description',
    iconName: 'test-icon',
    iconSource: 'test-source',
    pendingItems: 2,
    rejectedItems: 1,
    successItems: 3,
    summary: 'Test Summary',
    showApprove: true,
    showReject: true,
    showEdit: true,
    showItems: true,
    showSummary: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.card = mockCard;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.allowNavigate).toBeTrue();
    expect(component.allowApprove).toBeTrue();
  });

  it('should render card with all properties', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.card-title').textContent).toContain('Test Card');
    expect(compiled.querySelector('ion-icon[name="test-icon"]')).toBeTruthy();
    expect(compiled.querySelector('p').textContent).toContain('Test Action Test Description');
    expect(compiled.querySelector('.summary-badge').textContent).toContain('Test Summary');
  });

  it('should render badges when showItems is true', () => {
    const compiled = fixture.nativeElement;
    const badges = compiled.querySelectorAll('.badges-left ion-badge');
    expect(badges.length).toBe(3);
    expect(badges[0].textContent.trim()).toBe('3');
    expect(badges[1].textContent.trim()).toBe('2');
    expect(badges[2].textContent.trim()).toBe('1');
  });

  it('should show approve button when conditions are met', () => {
    const compiled = fixture.nativeElement;
    const approveButton = compiled.querySelector('ion-button[color="success"]');
    expect(approveButton).toBeTruthy();
    expect(approveButton.querySelector('ion-icon[name="checkmark"]')).toBeTruthy();
  });

  it('should show reject button when conditions are met', () => {
    component.card = {
      ...mockCard,
      successItems: 0
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const rejectButton = compiled.querySelector('ion-button[color="danger"]');
    expect(rejectButton).toBeTruthy();
    expect(rejectButton.querySelector('ion-icon[name="close"]')).toBeTruthy();
  });

  it('should emit edit event when onEdit is called', () => {
    spyOn(component.edit, 'emit');
    component.onEdit(mockCard);
    expect(component.edit.emit).toHaveBeenCalledWith(mockCard);
  });

  it('should emit approve event when onApprove is called', () => {
    spyOn(component.approve, 'emit');
    component.onApprove(mockCard.id);
    expect(component.approve.emit).toHaveBeenCalledWith(mockCard.id);
  });

  it('should emit reject event when onReject is called', () => {
    spyOn(component.reject, 'emit');
    component.onReject(mockCard.id);
    expect(component.reject.emit).toHaveBeenCalledWith(mockCard.id);
  });

  it('should handle undefined card input', () => {
    component.card = undefined as any;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should handle card with missing properties', () => {
    const incompleteCard: Card = {
      id: '1',
      title: 'Test Card',
      status: STATUS.PENDING,
      type: 'activity'
    };
    component.card = incompleteCard;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not show items when showItems is false', () => {
    component.card = {
      ...mockCard,
      showItems: false
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.badges-left')).toBeFalsy();
  });

  it('should not show summary when showSummary is false', () => {
    component.card = {
      ...mockCard,
      showSummary: false
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.summary-badge')).toBeFalsy();
  });

  it('should not show approve button when allowApprove is false', () => {
    component.allowApprove = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-button[color="success"]')).toBeFalsy();
  });

  it('should not show reject button when allowApprove is false', () => {
    component.allowApprove = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-button[color="danger"]')).toBeFalsy();
  });

  it('should apply clickable class when allowNavigate is true', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.card-container.clickable')).toBeTruthy();
  });

  it('should not apply clickable class when allowNavigate is false', () => {
    component.allowNavigate = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.card-container.clickable')).toBeFalsy();
  });

  it('should show edit icon when showEdit is true and status is pending', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-icon[name="pencil"]')).toBeTruthy();
  });

  it('should show eye icon when showEdit is true and status is pending', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-icon[name="eye"]')).toBeTruthy();
  });

  it('should not show edit or eye icons when showEdit is false', () => {
    component.card = {
      ...mockCard,
      showEdit: false
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('ion-icon[name="pencil"]')).toBeFalsy();
    expect(compiled.querySelector('ion-icon[name="eye"]')).toBeFalsy();
  });
});
