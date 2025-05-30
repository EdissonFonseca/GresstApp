import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { ChatInterlocutorsPage } from './chat-interlocutors.page';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Interlocutor } from 'src/app/interfaces/interlocutor.interface';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';

describe('ChatInterlocutorsPage', () => {
  let component: ChatInterlocutorsPage;
  let fixture: ComponentFixture<ChatInterlocutorsPage>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let masterdataServiceSpy: jasmine.SpyObj<MasterDataApiService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;

  const mockInterlocutor: Interlocutor = {
    IdInterlocutor: '1',
    Nombre: 'Test Interlocutor',
    Correo: 'test@example.com',
    Fecha: '2024-03-20',
    Mensaje: 'Test message'
  };

  beforeEach(async () => {
    const navSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    const masterdataSpy = jasmine.createSpyObj('MasterDataApiService', ['getCounterparts']);
    const notificationSpy = jasmine.createSpyObj('UserNotificationService', ['showLoading', 'hideLoading']);

    await TestBed.configureTestingModule({
      declarations: [ChatInterlocutorsPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: {
              subscribe: (fn: (value: any) => void) => fn({ IdResiduo: '123' })
            }
          }
        },
        { provide: NavController, useValue: navSpy },
        { provide: MasterDataApiService, useValue: masterdataSpy },
        { provide: UserNotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    navControllerSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    masterdataServiceSpy = TestBed.inject(MasterDataApiService) as jasmine.SpyObj<MasterDataApiService>;
    userNotificationServiceSpy = TestBed.inject(UserNotificationService) as jasmine.SpyObj<UserNotificationService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatInterlocutorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.interlocutores).toEqual([]);
    expect(component.idResiduo).toBe('');
  });

  it('should load interlocutors on init', fakeAsync(() => {
    const mockInterlocutors = [mockInterlocutor];
    masterdataServiceSpy.getCounterparts.and.returnValue(Promise.resolve(mockInterlocutors));

    component.ngOnInit();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(masterdataServiceSpy.getCounterparts).toHaveBeenCalledWith('123');
    expect(component.interlocutores).toEqual(mockInterlocutors);
    expect(component.idResiduo).toBe('123');
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle error when loading interlocutors', fakeAsync(() => {
    masterdataServiceSpy.getCounterparts.and.returnValue(Promise.reject('Error'));

    component.ngOnInit();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ...');
    expect(masterdataServiceSpy.getCounterparts).toHaveBeenCalledWith('123');
    expect(component.interlocutores).toEqual([]);
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should navigate to chat with correct parameters', () => {
    component.idResiduo = '123';
    const idInterlocutor = '1';
    const interlocutor = 'Test Interlocutor';

    component.navigateToChat(idInterlocutor, interlocutor);

    expect(navControllerSpy.navigateForward).toHaveBeenCalledWith('/chat', {
      queryParams: {
        IdResiduo: '123',
        IdInterlocutor: '1',
        Interlocutor: 'Test Interlocutor'
      }
    });
  });

  it('should handle empty interlocutors list', fakeAsync(() => {
    masterdataServiceSpy.getCounterparts.and.returnValue(Promise.resolve([]));

    component.ngOnInit();
    tick();

    expect(component.interlocutores).toEqual([]);
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle undefined query params', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [ChatInterlocutorsPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: {
              subscribe: (fn: (value: any) => void) => fn({})
            }
          }
        },
        { provide: NavController, useValue: navControllerSpy },
        { provide: MasterDataApiService, useValue: masterdataServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInterlocutorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.ngOnInit();
    tick();

    expect(component.idResiduo).toBe('');
    expect(masterdataServiceSpy.getCounterparts).toHaveBeenCalledWith('');
  }));
});
