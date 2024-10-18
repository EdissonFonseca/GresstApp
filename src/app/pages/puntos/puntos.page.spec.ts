import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PuntosPage } from './puntos.page';

describe('PuntosPage', () => {
  let component: PuntosPage;
  let fixture: ComponentFixture<PuntosPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(PuntosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
