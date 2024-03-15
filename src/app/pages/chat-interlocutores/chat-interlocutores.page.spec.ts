import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatInterlocutoresPage } from './chat-interlocutores.page';

describe('ChatInterlocutoresPage', () => {
  let component: ChatInterlocutoresPage;
  let fixture: ComponentFixture<ChatInterlocutoresPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatInterlocutoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
