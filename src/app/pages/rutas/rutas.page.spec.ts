import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RutasPage } from './rutas.page';

describe('RutasPage', () => {
  let component: RutasPage;
  let fixture: ComponentFixture<RutasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RutasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
