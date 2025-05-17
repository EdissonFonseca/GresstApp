import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TareasPage } from './tareas.page';

describe('TareasPage', () => {
  let component: TareasPage;
  let fixture: ComponentFixture<TareasPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TareasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
