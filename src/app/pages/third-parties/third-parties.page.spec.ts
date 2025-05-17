import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TercerosPage } from './terceros.page';

describe('TercerosPage', () => {
  let component: TercerosPage;
  let fixture: ComponentFixture<TercerosPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TercerosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
