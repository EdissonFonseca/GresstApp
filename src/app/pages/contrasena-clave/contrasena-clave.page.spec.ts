import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContrasenaClavePage } from './contrasena-clave.page';

describe('ContrasenaClavePage', () => {
  let component: ContrasenaClavePage;
  let fixture: ComponentFixture<ContrasenaClavePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ContrasenaClavePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
