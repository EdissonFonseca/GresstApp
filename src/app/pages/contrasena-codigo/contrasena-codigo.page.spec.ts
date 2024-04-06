import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContrasenaCodigoPage } from './contrasena-codigo.page';

describe('ContrasenaCodigoPage', () => {
  let component: ContrasenaCodigoPage;
  let fixture: ComponentFixture<ContrasenaCodigoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ContrasenaCodigoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
