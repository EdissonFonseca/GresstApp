import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProduccionPage } from './produccion.page';

describe('ProduccionPage', () => {
  let component: ProduccionPage;
  let fixture: ComponentFixture<ProduccionPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ProduccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
