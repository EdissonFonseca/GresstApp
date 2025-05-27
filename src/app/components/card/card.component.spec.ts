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
    color: '#FFF8E1'
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
});
