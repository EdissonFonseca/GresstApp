import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { ModalController, NavController } from '@ionic/angular';
import { LocationComponent } from 'src/app/components/location/location.component';
import { ActivatedRoute } from '@angular/router';
import { Punto } from 'src/app/interfaces/punto.interface';
import { environment } from 'src/environments/environment';
import { ActividadesService } from 'src/app/services/actividades.service';
import { MasterDataService } from 'src/app/services/masterdata.service';

@Component({
    selector: 'app-mapa',
    templateUrl: './mapa.page.html',
    styleUrls: ['./mapa.page.scss'],
  })
export class MapaPage implements OnInit, AfterViewInit {
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  gresstMap !: GoogleMap;
  idActividad!: string;
  // directionsService = new google.maps.DirectionsService();
  // directionsRenderer = new google.maps.DirectionsRenderer();
  origin = { lat: 0, lng: 0 };
  destination = { lat: 0, lng: 0 }; // Destino final
  wayPoints: Array<{ lat: number, lng: number }> = [
    { lat: 4.659383846282959, lng: -74.05394073486328 },
    { lat: 4.669383846282959, lng: -74.03394073486328 },
  ];
  puntos: Punto[] = [];

  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private actividadesService: ActividadesService,
    private masterDataService: MasterDataService) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad = params["IdActividad"]
    });
    this.puntos = await this.masterDataService.getPuntosFromTareas(this.idActividad);
  }

  async ngAfterViewInit() {
    await this.createMap();
  }

  async createMap() {
    const currentLocation = await Geolocation.getCurrentPosition();
    const actividad = await this.actividadesService.get(this.idActividad);

    this.origin.lat = currentLocation.coords.latitude;
    this.origin.lng = currentLocation.coords.longitude;
    if (actividad && actividad.Destino?.Latitud != null && actividad.Destino?.Longitud != null){
      this.destination.lat = parseFloat(actividad.Destino.Latitud);
      this.destination.lng = parseFloat(actividad.Destino.Longitud);
    } else {
      this.destination.lat = currentLocation.coords.latitude;
      this.destination.lng = currentLocation.coords.longitude;
    }

    this.gresstMap = await GoogleMap.create({
      id: 'gresstMap',
      element: this.mapRef.nativeElement,
      apiKey: environment.GOOGLE_MAPS_API_KEY,
      config: {
        center: {
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        },
        zoom: 8,
      },
    });
    await this.addMarkers();
    await this.addListeners();
    //await this.calculateRoute();
  }

  async addMarkers(){
    const currentLocation = await Geolocation.getCurrentPosition();
    const markers = this.puntos.filter((punto) => punto.Longitud != null && punto.Longitud != "" && punto.Latitud != null && punto.Latitud !=  "")
      .map((punto) => ({
        coordinate: { lat: parseFloat(punto.Latitud ?? ''), lng: parseFloat(punto.Longitud ?? '')},
        title: punto.Nombre,
        snippet: punto.Direccion!}
      ));
    markers.push({coordinate: {lat: currentLocation.coords.latitude, lng: currentLocation.coords.longitude}, title:'Origen', snippet:'Origen'});

    await this.gresstMap.addMarkers(markers);
  }

  async addListeners() {
    await this.gresstMap.setOnMarkerClickListener(async (marker) => {
      const modal = await this.modalCtrl.create({
        component: LocationComponent,
        componentProps: {
          marker,
        },
        breakpoints: [0,0,3],
        initialBreakpoint: 0.3,
      });
      modal.present();
    });

    await this.gresstMap.setOnMapClickListener((position: any) => {
      const marker = {
        coordinate: {
          lat: position.lat,
          lng: position.lng,
        },
        title: 'Nuevo punto'
      };
      this.gresstMap.addMarker(marker);
    });
  }

  calculateRoute() {
    // const request = {
    //   origin: this.origin,
    //   destination: this.destination,
    //   waypoints: this.wayPoints.map((point) => ({
    //     location: new google.maps.LatLng(point.lat, point.lng),
    //     stopover: true, //new google.maps.LatLng(point.lat, point.lng),
    //   })),
    //   optimizeWaypoints: true,
    //   travelMode: google.maps.TravelMode.DRIVING,
    // };

    // this.directionsService.route(request, (result, status) => {
    //   if (status === google.maps.DirectionsStatus.OK) {
    //     this.directionsRenderer.setDirections(result);
    //   } else {
    //     alert('No se pudo mostrar la ruta: ' + status);
    //   }
    // });
  }
}
