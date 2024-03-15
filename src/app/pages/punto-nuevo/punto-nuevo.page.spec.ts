import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PuntoNuevoPage } from './punto-nuevo.page';

describe('PuntoNuevoPage', () => {
  let component: PuntoNuevoPage;
  let fixture: ComponentFixture<PuntoNuevoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PuntoNuevoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
