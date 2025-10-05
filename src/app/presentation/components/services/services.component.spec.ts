import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServicesComponent } from './services.component';
import { ServicesService } from '@app/infrastructure/repositories/masterdata/services.repository';
import { SERVICES } from '@app/core/constants';
import { Servicio } from '@app/domain/entities/servicio.entity';

describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;
  let servicesServiceSpy: jasmine.SpyObj<ServicesService>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;

  const mockServices: Servicio[] = [
    { IdServicio: '1', Nombre: 'Servicio 1' },
    { IdServicio: '2', Nombre: 'Servicio 2' }
  ];

  beforeEach(waitForAsync(() => {
    servicesServiceSpy = jasmine.createSpyObj('ServicesService', ['list', 'create', 'delete']);
    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);

    TestBed.configureTestingModule({
      declarations: [ServicesComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: ServicesService, useValue: servicesServiceSpy },
        { provide: ToastController, useValue: toastCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showHeader).toBeTrue();
    expect(component.services).toEqual([]);
    expect(component.selectedValue).toBe('');
    expect(component.selectedName).toBe('');
    expect(component.searchText).toBe('');
    expect(component.items).toEqual([]);
  });

  it('should load services and initialize items on init', async () => {
    servicesServiceSpy.list.and.returnValue(Promise.resolve(mockServices));
    const mockToast: any = { present: () => Promise.resolve() };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast));

    await component.ngOnInit();

    expect(servicesServiceSpy.list).toHaveBeenCalled();
    expect(component.services).toEqual(mockServices);
    expect(component.items.length).toBe(SERVICES.length);
    expect(component.items[0].selected).toBeTrue(); // First service is selected
    expect(component.items[1].selected).toBeTrue(); // Second service is selected
  });

  it('should handle service selection change - adding service', async () => {
    const serviceId = '3';
    const checked = true;
    servicesServiceSpy.create.and.returnValue(Promise.resolve());
    const mockToast: any = { present: () => Promise.resolve() };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast));

    await component.changeSelection(serviceId, checked);

    expect(servicesServiceSpy.create).toHaveBeenCalledWith(serviceId);
    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Servicio agregado',
      duration: 1500,
      position: 'top'
    });
  });

  it('should handle service selection change - removing service', async () => {
    const serviceId = '1';
    const checked = false;
    servicesServiceSpy.delete.and.returnValue(Promise.resolve());
    const mockToast: any = { present: () => Promise.resolve() };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast));

    await component.changeSelection(serviceId, checked);

    expect(servicesServiceSpy.delete).toHaveBeenCalledWith(serviceId);
    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Servicio eliminado',
      duration: 1500,
      position: 'top'
    });
  });

  it('should handle error when changing service selection', async () => {
    const serviceId = '1';
    const checked = true;
    servicesServiceSpy.create.and.returnValue(Promise.reject('Error'));
    const mockToast: any = { present: () => Promise.resolve() };
    toastCtrlSpy.create.and.returnValue(Promise.resolve(mockToast));

    await component.changeSelection(serviceId, checked);

    expect(toastCtrlSpy.create).toHaveBeenCalledWith({
      message: 'Error al modificar el servicio',
      duration: 1500,
      position: 'top'
    });
  });
});
