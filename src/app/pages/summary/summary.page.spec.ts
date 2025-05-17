import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { SummaryPage } from './summary.page';
import { CardService } from '@app/services/core/card.service';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { Card } from '@app/interfaces/card';
import { STATUS } from '@app/constants/constants';

describe('SummaryPage', () => {
  let component: SummaryPage;
  let fixture: ComponentFixture<SummaryPage>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;

  const mockCard: Card = {
    id: '1',
    title: 'Test Activity',
    status: STATUS.PENDING,
    type: 'activity',
    pendingItems: 2,
    rejectedItems: 1,
    successItems: 3,
    quantity: 100,
    weight: 50,
    volume: 25
  };

  beforeEach(waitForAsync(() => {
    navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['mapActividades', 'mapTransacciones']);
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['getSummary']);
    transactionsServiceSpy = jasmine.createSpyObj('TransactionsService', ['getSummary']);

    TestBed.configureTestingModule({
      declarations: [SummaryPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: CardService, useValue: cardServiceSpy },
        { provide: ActivitiesService, useValue: activitiesServiceSpy },
        { provide: TransactionsService, useValue: transactionsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty cards', () => {
    expect(component.cards).toEqual([]);
  });

  it('should load activities on initialization', fakeAsync(async () => {
    const mockActivities = [mockCard];
    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve(mockActivities));

    await component.ngOnInit();
    tick();

    expect(cardServiceSpy.mapActividades).toHaveBeenCalled();
    expect(component.cards).toEqual(mockActivities);
  }));

  it('should handle error when loading activities', fakeAsync(async () => {
    const error = new Error('Failed to load activities');
    cardServiceSpy.mapActividades.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    await component.ngOnInit();
    tick();

    expect(console.error).toHaveBeenCalledWith('❌ Error loading activities:', error);
    expect(component.cards).toEqual([]);
  }));

  it('should navigate to activity details when card is clicked', () => {
    component.onCardClick(mockCard);

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/activities', {
      state: { activity: mockCard }
    });
  });

  it('should navigate to transaction details when transaction card is clicked', () => {
    const transactionCard: Card = {
      ...mockCard,
      type: 'transaction',
      parentId: '1'
    };

    component.onCardClick(transactionCard);

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/transactions', {
      state: { activity: transactionCard }
    });
  });

  it('should navigate to task details when task card is clicked', () => {
    const taskCard: Card = {
      ...mockCard,
      type: 'task',
      parentId: '1'
    };

    component.onCardClick(taskCard);

    expect(navCtrlSpy.navigateForward).toHaveBeenCalledWith('/tasks', {
      state: { activity: taskCard }
    });
  });

  it('should refresh cards when pull-to-refresh is triggered', fakeAsync(async () => {
    const mockActivities = [mockCard];
    cardServiceSpy.mapActividades.and.returnValue(Promise.resolve(mockActivities));

    const mockEvent = {
      target: {
        complete: jasmine.createSpy('complete')
      }
    };

    await component.doRefresh(mockEvent as any);
    tick();

    expect(cardServiceSpy.mapActividades).toHaveBeenCalled();
    expect(component.cards).toEqual(mockActivities);
    expect(mockEvent.target.complete).toHaveBeenCalled();
  }));

  it('should handle error during refresh', fakeAsync(async () => {
    const error = new Error('Failed to refresh');
    cardServiceSpy.mapActividades.and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    const mockEvent = {
      target: {
        complete: jasmine.createSpy('complete')
      }
    };

    await component.doRefresh(mockEvent as any);
    tick();

    expect(console.error).toHaveBeenCalledWith('❌ Error refreshing activities:', error);
    expect(mockEvent.target.complete).toHaveBeenCalled();
  }));
});
