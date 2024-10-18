import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ServiciosPage } from './servicios.page';

describe('ServiciosPage', () => {
  let component: ServiciosPage;
  let fixture: ComponentFixture<ServiciosPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ServiciosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
