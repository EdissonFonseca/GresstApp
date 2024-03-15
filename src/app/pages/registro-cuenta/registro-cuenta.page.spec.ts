import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroCuentaPage } from './registro-cuenta.page';

describe('RegistroCuentaPage', () => {
  let component: RegistroCuentaPage;
  let fixture: ComponentFixture<RegistroCuentaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RegistroCuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
