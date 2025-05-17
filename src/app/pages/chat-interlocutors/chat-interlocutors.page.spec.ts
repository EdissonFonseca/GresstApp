import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatInterlocutoresPage } from './chat-interlocutores.page';

describe('ChatInterlocutoresPage', () => {
  let component: ChatInterlocutoresPage;
  let fixture: ComponentFixture<ChatInterlocutoresPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ChatInterlocutoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
