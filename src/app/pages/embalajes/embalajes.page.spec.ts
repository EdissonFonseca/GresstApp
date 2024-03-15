import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmbalajesPage } from './embalajes.page';

describe('EmbalajesPage', () => {
  let component: EmbalajesPage;
  let fixture: ComponentFixture<EmbalajesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EmbalajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
