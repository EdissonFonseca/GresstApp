import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContrasenaCorreoPage } from './contrasena-correo.page';

describe('ContrasenaCorreoPage', () => {
  let component: ContrasenaCorreoPage;
  let fixture: ComponentFixture<ContrasenaCorreoPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ContrasenaCorreoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
