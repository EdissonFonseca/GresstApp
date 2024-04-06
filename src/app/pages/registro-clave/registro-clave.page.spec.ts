import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroClavePage } from './registro-clave.page';

describe('RegistroClavePage', () => {
  let component: RegistroClavePage;
  let fixture: ComponentFixture<RegistroClavePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RegistroClavePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
