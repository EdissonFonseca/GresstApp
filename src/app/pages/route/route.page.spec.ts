import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { RoutePage } from './route.page';
import { ActivatedRoute } from '@angular/router';
import { PointsService } from '@app/services/masterdata/points.service';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { Punto } from 'src/app/interfaces/punto.interface';
import { Geolocation } from '@capacitor/geolocation';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/components/components.module';
import { signal } from '@angular/core';

describe('RoutePage', () => {
  let component: RoutePage;
  let fixture: ComponentFixture<RoutePage>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;
  let pointsServiceSpy: jasmine.SpyObj<PointsService>;
  let activitiesServiceSpy: jasmine.SpyObj<ActivitiesService>;

  const mockPuntos: Punto[] = [
    {
      IdDeposito: '1',
      Nombre: 'Punto 1',
      Latitud: '4.6105',
      Longitud: '-74.0817',
      Tipo: 'Acopio',
      Tercero: 'true',
      Acopio: true,
      Almacenamiento: false,
      Disposicion: false,
      Entrega: false,
      Generacion: false,
      Recepcion: false,
      Tratamiento: false,
      IdPersona: '1',
      IdMateriales: []
    },
    {
      IdDeposito: '2',
      Nombre: 'Punto 2',
      Latitud: '4.6399',
      Longitud: '-74.0824',
      Tipo: 'Almacenamiento',
      Tercero: 'true',
      Acopio: false,
      Almacenamiento: true,
      Disposicion: false,
      Entrega: false,
      Generacion: false,
      Recepcion: false,
      Tratamiento: false,
      IdPersona: '1',
      IdMateriales: []
    }
  ];

  const mockActividad: Actividad = {
    IdActividad: '123',
    IdServicio: '1',
    IdRecurso: '1',
    Titulo: 'Test Activity',
    FechaOrden: new Date().toISOString(),
    IdEstado: '1',
    NavegarPorTransaccion: true,
    Destino: mockPuntos[0]
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: {
        subscribe: (callback: any) => callback({ IdActividad: '123' })
      }
    });
    pointsServiceSpy = jasmine.createSpyObj('PointsService', ['getPointsFromPendingTasks$', 'list']);
    activitiesServiceSpy = jasmine.createSpyObj('ActivitiesService', ['get']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        FormsModule,
        ComponentsModule,
        RoutePage
      ],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: PointsService, useValue: pointsServiceSpy },
        { provide: ActivitiesService, useValue: activitiesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with activity ID from route params', fakeAsync(async () => {
    pointsServiceSpy.getPointsFromPendingTasks$.and.returnValue(signal(mockPuntos));
    spyOn(component, 'loadGoogleMaps');

    await component.ngOnInit();
    tick();

    expect(component.idActividad).toBe('123');
    expect(pointsServiceSpy.getPointsFromPendingTasks$).toHaveBeenCalledWith('123');
    expect(component.puntos).toEqual(mockPuntos);
    expect(component.loadGoogleMaps).toHaveBeenCalled();
  }));

  it('should load Google Maps script', fakeAsync(async () => {
    const scriptSpy = spyOn(document, 'createElement').and.returnValue({
      src: '',
      async: true,
      defer: true,
      onload: () => {},
      setAttribute: () => {}
    } as any);
    spyOn(document.body, 'appendChild');

    await component.loadGoogleMaps();
    tick();

    expect(scriptSpy).toHaveBeenCalledWith('script');
    expect(document.body.appendChild).toHaveBeenCalled();
  }));

  it('should get current position', fakeAsync(async () => {
    const mockPosition = {
      coords: {
        latitude: 4.6105,
        longitude: -74.0817
      }
    };
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.resolve(mockPosition as any));

    await component.getCurrentPosition();
    tick();

    expect(component.origin.lat).toBe(4.6105);
    expect(component.origin.lng).toBe(-74.0817);
  }));

  it('should handle geolocation error', fakeAsync(async () => {
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.reject('Geolocation error'));
    spyOn(console, 'error');

    await component.getCurrentPosition();
    tick();

    expect(console.error).toHaveBeenCalledWith('❌ Error al obtener la ubicación actual:', 'Geolocation error');
  }));

  it('should get destination position from activity', fakeAsync(async () => {
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(mockActividad));
    pointsServiceSpy.list.and.returnValue(Promise.resolve(mockPuntos));

    await component.getDestinationPosition();
    tick();

    expect(component.destination.lat).toBe(4.6105);
    expect(component.destination.lng).toBe(-74.0817);
  }));

  it('should use default destination when activity has no destination', fakeAsync(async () => {
    const activityWithoutDestination = { ...mockActividad, Destino: undefined };
    activitiesServiceSpy.get.and.returnValue(Promise.resolve(activityWithoutDestination));

    await component.getDestinationPosition();
    tick();

    expect(component.destination.lat).toBe(4.6097);
    expect(component.destination.lng).toBe(-74.0817);
  }));

  it('should calculate route with waypoints', fakeAsync(async () => {
    const mockDirectionsService = {
      route: jasmine.createSpy('route').and.callFake((request: any, callback: any) => {
        callback({ routes: [] }, 'OK');
      })
    };
    const mockDirectionsRenderer = {
      setDirections: jasmine.createSpy('setDirections')
    };
    const mockMap = {
      setCenter: jasmine.createSpy('setCenter')
    };

    component.directionsService = mockDirectionsService;
    component.directionsRenderer = mockDirectionsRenderer;
    component.map = mockMap;
    component.puntos = mockPuntos;

    component.calculateRoute();
    tick();

    expect(mockDirectionsService.route).toHaveBeenCalled();
    expect(mockDirectionsRenderer.setDirections).toHaveBeenCalled();
  }));

  it('should handle route calculation error', fakeAsync(async () => {
    const mockDirectionsService = {
      route: jasmine.createSpy('route').and.callFake((request: any, callback: any) => {
        callback(null, 'ERROR');
      })
    };
    const mockDirectionsRenderer = {
      setDirections: jasmine.createSpy('setDirections')
    };
    const mockMap = {
      setCenter: jasmine.createSpy('setCenter')
    };
    spyOn(window, 'alert');

    component.directionsService = mockDirectionsService;
    component.directionsRenderer = mockDirectionsRenderer;
    component.map = mockMap;
    component.puntos = mockPuntos;

    component.calculateRoute();
    tick();

    expect(window.alert).toHaveBeenCalledWith('No se pudo mostrar la ruta: ERROR');
  }));

  it('should render map container', () => {
    const compiled = fixture.nativeElement;
    const mapContainer = compiled.querySelector('#map');
    expect(mapContainer).toBeTruthy();
  });
});
