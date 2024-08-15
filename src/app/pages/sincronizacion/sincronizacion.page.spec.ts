import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SincronizacionPage } from './sincronizacion.page';

describe('SincronizacionPage', () => {
  let component: SincronizacionPage;
  let fixture: ComponentFixture<SincronizacionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SincronizacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
