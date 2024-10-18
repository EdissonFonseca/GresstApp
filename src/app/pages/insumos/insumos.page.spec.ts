import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InsumosPage } from './insumos.page';

describe('InsumosPage', () => {
  let component: InsumosPage;
  let fixture: ComponentFixture<InsumosPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(InsumosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
