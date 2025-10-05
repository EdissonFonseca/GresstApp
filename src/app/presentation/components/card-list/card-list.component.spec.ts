import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CardListComponent } from './card-list.component';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { STATUS } from '@app/core/constants';
import { CardComponent } from '../card/card.component';

describe('CardListComponent', () => {
  let component: CardListComponent;
  let fixture: ComponentFixture<CardListComponent>;

  const mockCards: Card[] = [
    {
      id: '1',
      title: 'Test Card 1',
      status: STATUS.PENDING,
      type: 'activity',
      color: '#FFF8E1',
      actionName: 'Test Action 1',
      description: 'Test Description 1',
      iconName: 'test-icon-1',
      iconSource: 'test-source-1',
      pendingItems: 2,
      rejectedItems: 1,
      successItems: 3,
      summary: 'Test Summary 1',
      showApprove: true,
      showReject: true,
      showEdit: true,
      showItems: true,
      showSummary: true
    },
    {
      id: '2',
      title: 'Test Card 2',
      status: STATUS.PENDING,
      type: 'transaction',
      color: '#E8F5E9',
      actionName: 'Test Action 2',
      description: 'Test Description 2',
      iconName: 'test-icon-2',
      iconSource: 'test-source-2',
      pendingItems: 1,
      rejectedItems: 0,
      successItems: 4,
      summary: 'Test Summary 2',
      showApprove: true,
      showReject: false,
      showEdit: true,
      showItems: true,
      showSummary: true
    }
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CardListComponent, CardComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CardListComponent);
    component = fixture.componentInstance;
    component.cards = mockCards;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.allowNavigate).toBeTrue();
    expect(component.allowApprove).toBeTrue();
    expect(component.allowCustom).toBeFalse();
    expect(component.showEdit).toBeTrue();
  });

  it('should render list of cards', () => {
    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('app-card');
    expect(cards.length).toBe(2);
  });

  it('should render empty list when no cards provided', () => {
    component.cards = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('app-card');
    expect(cards.length).toBe(0);
  });

  it('should pass correct props to each card', () => {
    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('app-card');

    cards.forEach((cardElement: Element, index: number) => {
      const card = cardElement as HTMLElement;
      expect(card.getAttribute('aria-label')).toBe(mockCards[index].title);
      expect(card.getAttribute('role')).toBe('listitem');
    });
  });

  it('should emit edit event when card edit is triggered', () => {
    spyOn(component.edit, 'emit');
    const cardToEdit = mockCards[0];

    component.onEdit(cardToEdit);

    expect(component.edit.emit).toHaveBeenCalledWith(cardToEdit);
  });

  it('should emit approve event when card approve is triggered', () => {
    spyOn(component.approve, 'emit');
    const cardToApprove = mockCards[0];

    component.onApprove(cardToApprove.id);

    expect(component.approve.emit).toHaveBeenCalledWith(cardToApprove.id);
  });

  it('should emit reject event when card reject is triggered', () => {
    spyOn(component.reject, 'emit');
    const cardToReject = mockCards[0];

    component.onReject(cardToReject.id);

    expect(component.reject.emit).toHaveBeenCalledWith(cardToReject.id);
  });

  it('should emit custom event when card custom action is triggered', () => {
    spyOn(component.custom, 'emit');
    const cardForCustomAction = mockCards[0];

    component.onCustom(cardForCustomAction.id);

    expect(component.custom.emit).toHaveBeenCalledWith(cardForCustomAction.id);
  });

  it('should pass allowNavigate prop to cards', () => {
    component.allowNavigate = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('app-card');
    cards.forEach((card: Element) => {
      expect(card.getAttribute('ng-reflect-allow-navigate')).toBe('false');
    });
  });

  it('should pass allowApprove prop to cards', () => {
    component.allowApprove = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('app-card');
    cards.forEach((card: Element) => {
      expect(card.getAttribute('ng-reflect-allow-approve')).toBe('false');
    });
  });

  it('should handle undefined cards input', () => {
    component.cards = undefined as any;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should handle cards with missing properties', () => {
    const incompleteCards: Card[] = [{
      id: '1',
      title: 'Test Card',
      status: STATUS.PENDING,
      type: 'activity'
    }];
    component.cards = incompleteCards;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should maintain list structure with different card types', () => {
    const mixedCards: Card[] = [
      { ...mockCards[0], type: 'activity' },
      { ...mockCards[1], type: 'transaction' },
      { ...mockCards[0], type: 'task', id: '3' }
    ];
    component.cards = mixedCards;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('app-card');
    expect(cards.length).toBe(3);
  });

  it('should handle empty cards array', () => {
    component.cards = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('app-card');
    expect(cards.length).toBe(0);
  });

  it('should handle null cards array', () => {
    component.cards = null as any;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('app-card');
    expect(cards.length).toBe(0);
  });
});
