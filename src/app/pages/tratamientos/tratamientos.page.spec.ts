import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TratamientosPage } from './tratamientos.page';

describe('TratamientosPage', () => {
  let component: TratamientosPage;
  let fixture: ComponentFixture<TratamientosPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TratamientosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
