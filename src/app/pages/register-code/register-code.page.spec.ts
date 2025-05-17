import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegistroCodigoPage } from './registro-codigo.page';

describe('RegistroCodigoPage', () => {
  let component: RegistroCodigoPage;
  let fixture: ComponentFixture<RegistroCodigoPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(RegistroCodigoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
