import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActividadesPage } from './actividades.page';

describe('ActividadesPage', () => {
  let component: ActividadesPage;
  let fixture: ComponentFixture<ActividadesPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ActividadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
