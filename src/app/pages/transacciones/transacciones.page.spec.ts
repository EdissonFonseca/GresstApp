import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransaccionesPage } from './transacciones.page';

describe('TransaccionesPage', () => {
  let component: TransaccionesPage;
  let fixture: ComponentFixture<TransaccionesPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TransaccionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
