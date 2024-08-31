import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { ModalController } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { MasterDataService } from 'src/app/services/masterdata.service';
import { environment } from 'src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.page.html',
  styleUrls: ['./ruta.page.scss'],
})
export class RutaPage implements OnInit {
  map: any;
  directionsService: any;
  directionsRenderer: any;
  idActividad!: string;
  puntos: Punto[] = [];

  origin = { lat: 4.6105, lng: -74.0817 };
  destination = { lat: 4.6399, lng: -74.0824 };

  constructor(    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private masterDataService: MasterDataService,
    private actividadesService: ActividadesService) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad = params["IdActividad"]
    });
    this.puntos = await this.masterDataService.getPuntosFromTareasPendientes(this.idActividad);
    await this.loadGoogleMaps();
  }

  async loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initMap();
    };
    document.body.appendChild(script);
  }

  initMap() {
    const mapElement = document.getElementById('map');

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();

    this.map = new google.maps.Map(mapElement, {
      center: this.origin,
      zoom: 12,
    });

    this.directionsRenderer.setMap(this.map);

    this.getCurrentPosition();
    this.calculateRoute();
  }

  async getCurrentPosition() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.origin.lat = position.coords.latitude;
      this.origin.lng = position.coords.longitude;

      this.map.setCenter({ lat: this.origin.lat, lng: this.origin.lng });

      new google.maps.Marker({
        position: { lat: this.origin.lat, lng: this.origin.lng },
        map: this.map,
        title: "Tu ubicación",
      });
    } catch (error) {
      console.error('Error al obtener la ubicación actual:', error);
      alert('No se pudo obtener la ubicación actual.');
    }
  }

  async getDestinationPosition() {
    const currentLocation = await Geolocation.getCurrentPosition();
    const actividad = await this.actividadesService.get(this.idActividad);

    if (actividad && actividad.Destino?.Latitud != null && actividad.Destino?.Longitud != null){
      this.destination.lat = parseFloat(actividad.Destino.Latitud);
      this.destination.lng = parseFloat(actividad.Destino.Longitud);
    } else {
      this.destination.lat = currentLocation.coords.latitude;
      this.destination.lng = currentLocation.coords.longitude;
    }
  }

  calculateRoute() {
    const request: google.maps.DirectionsRequest = {
      origin: this.origin,
      destination: this.destination,
      waypoints: this.puntos.filter((x) => x.Latitud != null && x.Longitud != null).map((point) => ({
        location: new google.maps.LatLng(point.Latitud, point.Longitud),
        stopover: true,
      })),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService.route(request, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
      } else {
        console.error('Error en la solicitud de direcciones:', status);
        alert('No se pudo mostrar la ruta: ' + status);
      }
    });
  }
}
