import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContrasenaCorreoPage } from './contrasena-correo.page';

describe('ContrasenaCorreoPage', () => {
  let component: ContrasenaCorreoPage;
  let fixture: ComponentFixture<ContrasenaCorreoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ContrasenaCorreoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
