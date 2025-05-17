import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CertificadosBuscarPage } from './certificados-buscar.page';

describe('CertificadosBuscarPage', () => {
  let component: CertificadosBuscarPage;
  let fixture: ComponentFixture<CertificadosBuscarPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CertificadosBuscarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
