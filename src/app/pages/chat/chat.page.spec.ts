import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ChatPage } from './chat.page';
import { ActivatedRoute } from '@angular/router';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { Mensaje } from 'src/app/interfaces/mensaje.interface';
import { RouterTestingModule } from '@angular/router/testing';

describe('ChatPage', () => {
  let component: ChatPage;
  let fixture: ComponentFixture<ChatPage>;
  let masterdataServiceSpy: jasmine.SpyObj<MasterDataApiService>;
  let userNotificationServiceSpy: jasmine.SpyObj<UserNotificationService>;

  const mockMessage: Mensaje = {
    EnvioRecepcion: 'R',
    Mensaje: 'Test message',
    Enviado: true,
    Leido: true,
    Fecha: '20/03/2024 10:00:00'
  };

  beforeEach(async () => {
    const masterdataSpy = jasmine.createSpyObj('MasterDataApiService', ['getMessages']);
    const notificationSpy = jasmine.createSpyObj('UserNotificationService', ['showLoading', 'hideLoading']);

    await TestBed.configureTestingModule({
      declarations: [ChatPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: {
              subscribe: (fn: (value: any) => void) => fn({
                IdResiduo: '123',
                IdInterlocutor: '456',
                Interlocutor: 'Test User'
              })
            }
          }
        },
        { provide: MasterDataApiService, useValue: masterdataSpy },
        { provide: UserNotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    masterdataServiceSpy = TestBed.inject(MasterDataApiService) as jasmine.SpyObj<MasterDataApiService>;
    userNotificationServiceSpy = TestBed.inject(UserNotificationService) as jasmine.SpyObj<UserNotificationService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.messages).toEqual([]);
    expect(component.newMessage).toBe('');
    expect(component.idInterlocutor).toBe('');
    expect(component.idResiduo).toBe('');
    expect(component.interlocutor).toBe('');
    expect(component.myName).toBe('');
  });

  it('should load messages on init', fakeAsync(() => {
    const mockMessages = [mockMessage];
    masterdataServiceSpy.getMessages.and.returnValue(Promise.resolve(mockMessages));

    component.ngOnInit();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ....');
    expect(masterdataServiceSpy.getMessages).toHaveBeenCalledWith('123', '456');
    expect(component.messages).toEqual(mockMessages);
    expect(component.idResiduo).toBe('123');
    expect(component.idInterlocutor).toBe('456');
    expect(component.interlocutor).toBe('Test User');
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should handle error when loading messages', fakeAsync(() => {
    masterdataServiceSpy.getMessages.and.returnValue(Promise.reject('Error'));

    component.ngOnInit();
    tick();

    expect(userNotificationServiceSpy.showLoading).toHaveBeenCalledWith('Sincronizando ....');
    expect(masterdataServiceSpy.getMessages).toHaveBeenCalledWith('123', '456');
    expect(component.messages).toEqual([]);
    expect(userNotificationServiceSpy.hideLoading).toHaveBeenCalled();
  }));

  it('should send a new message', () => {
    const initialLength = component.messages.length;
    component.newMessage = 'Test message';
    component.myName = 'Test User';

    component.sendMessage();

    expect(component.messages.length).toBe(initialLength + 1);
    expect(component.messages[initialLength].Mensaje).toBe('Test message');
    expect(component.messages[initialLength].EnvioRecepcion).toBe('E');
    expect(component.messages[initialLength].Enviado).toBeFalse();
    expect(component.messages[initialLength].Leido).toBeFalse();
    expect(component.newMessage).toBe('');
  });

  it('should not send empty message', () => {
    const initialLength = component.messages.length;
    component.newMessage = '   ';

    component.sendMessage();

    expect(component.messages.length).toBe(initialLength);
    expect(component.newMessage).toBe('   ');
  });

  it('should handle undefined query params', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [ChatPage],
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
        { provide: MasterDataApiService, useValue: masterdataServiceSpy },
        { provide: UserNotificationService, useValue: userNotificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.ngOnInit();
    tick();

    expect(component.idResiduo).toBe('');
    expect(component.idInterlocutor).toBe('');
    expect(component.interlocutor).toBe('');
    expect(masterdataServiceSpy.getMessages).toHaveBeenCalledWith('', '');
  }));
});
