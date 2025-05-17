import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PackagingPage } from './packaging.page';
import { PackagesComponent } from '@app/components/packages/packages.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('PackagingPage', () => {
  let component: PackagingPage;
  let fixture: ComponentFixture<PackagingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackagingPage, PackagesComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PackagingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render packages component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-packages')).toBeTruthy();
  });

  it('should pass showHeader as false to packages component', () => {
    const packagesComponent = fixture.debugElement.children[0].componentInstance;
    expect(packagesComponent.showHeader).toBeFalse();
  });
});
