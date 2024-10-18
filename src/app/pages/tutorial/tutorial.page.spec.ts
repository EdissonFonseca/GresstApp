import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TutorialPage } from './tutorial.page';

describe('TutorialPage', () => {
  let component: TutorialPage;
  let fixture: ComponentFixture<TutorialPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TutorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
