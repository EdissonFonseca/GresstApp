import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegistroCorreoPage } from './registro-correo.page';

describe('RegistroCorreoPage', () => {
  let component: RegistroCorreoPage;
  let fixture: ComponentFixture<RegistroCorreoPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(RegistroCorreoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
