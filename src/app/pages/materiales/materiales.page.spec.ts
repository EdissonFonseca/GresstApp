import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MaterialesPage } from './materiales.page';

describe('MaterialesPage', () => {
  let component: MaterialesPage;
  let fixture: ComponentFixture<MaterialesPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(MaterialesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
