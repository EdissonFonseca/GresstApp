import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
})
export class RutasPage implements OnInit {
  map: any;
  directionsService: any;
  directionsRenderer: any;

  origin = { lat: 4.6105, lng: -74.0817 };  // Centro histórico de Bogotá (La Candelaria)
  destination = { lat: 4.6399, lng: -74.0824 }; // Área de Chapinero

  wayPoints = [
    { location: { lat: 4.6094, lng: -74.0761 }, stopover: true },  // Ejemplo de punto intermedio cerca de La Candelaria
    { location: { lat: 4.6188, lng: -74.0733 }, stopover: true },  // Ejemplo de punto intermedio en el centro de Bogotá
  ];

  constructor() {}

  ngOnInit() {
    this.loadGoogleMaps();
  }

  loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_API_KEY}`;  // Reemplaza con tu API Key
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

  calculateRoute() {
    const request: google.maps.DirectionsRequest = {
      origin: this.origin,
      destination: this.destination,
      waypoints: this.wayPoints.map((point) => ({
        location: new google.maps.LatLng(point.location.lat, point.location.lng),
        stopover: point.stopover,
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
