/// <reference types="google.maps" />
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { ModalController } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { PointsService } from '@app/services/masterdata/points.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-route',
  templateUrl: './route.page.html',
  styleUrls: ['./route.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class RoutePage implements OnInit {
  map: any;
  directionsService: any;
  directionsRenderer: any;
  idActividad!: string;
  puntos: Punto[] = [];

  origin = { lat: 4.6105, lng: -74.0817 };
  destination = { lat: 4.6399, lng: -74.0824 };

  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private pointsService: PointsService,
    private activitiesService: ActivitiesService
  ) {}

  async ngOnInit() {
    console.log('🚀 Iniciando página de ruta');
    this.route.queryParams.subscribe(params => {
      this.idActividad = params["IdActividad"];
      console.log('📌 ID Actividad:', this.idActividad);
    });
    this.puntos = await this.pointsService.getPuntosFromTareasPendientes(this.idActividad);
    console.log('📍 Puntos obtenidos:', this.puntos);
    await this.loadGoogleMaps();
  }

  async loadGoogleMaps() {
    console.log('🗺️ Cargando Google Maps...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✅ Google Maps cargado correctamente');
      this.initMap();
    };
    document.body.appendChild(script);
  }

  async initMap() {
    console.log('🗺️ Inicializando mapa...');
    const mapElement = document.getElementById('map');
    await this.getCurrentPosition();
    await this.getDestinationPosition();

    console.log('📍 Ubicación actual:', this.origin);
    console.log('🎯 Destino:', this.destination);

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    if (mapElement) {
      this.map = new google.maps.Map(mapElement, {
        center: this.origin,
        zoom: 12,
      });
      this.directionsRenderer.setMap(this.map);
      this.map.setCenter({ lat: this.origin.lat, lng: this.origin.lng });
      this.calculateRoute();
    } else {
      console.error('❌ Elemento del mapa no encontrado');
      alert('No se pudo inicializar el mapa.');
    }
  }

  async getCurrentPosition() {
    try {
      console.log('📍 Obteniendo ubicación actual...');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      this.origin.lat = position.coords.latitude;
      this.origin.lng = position.coords.longitude;
      console.log('✅ Ubicación actual obtenida:', this.origin);
    } catch (error) {
      console.error('❌ Error al obtener la ubicación actual:', error);
    }
  }

  async getDestinationPosition() {
    console.log('🎯 Obteniendo posición del destino...');
    const actividad = await this.activitiesService.get(this.idActividad);
    console.log('📋 Actividad obtenida:', actividad);

    if (actividad?.Destino?.IdDeposito) {
      const idDeposito = actividad.Destino.IdDeposito;
      console.log('🔍 Buscando coordenadas del punto de destino:', idDeposito);
      // Buscar el punto en los puntos disponibles
      const puntos = await this.pointsService.list();
      const puntoDestino = puntos.find((p: Punto) => p.IdDeposito === idDeposito);
      console.log('📍 Punto de destino encontrado:', puntoDestino);

      if (puntoDestino?.Latitud && puntoDestino?.Longitud) {
        this.destination.lat = parseFloat(puntoDestino.Latitud);
        this.destination.lng = parseFloat(puntoDestino.Longitud);
        console.log('✅ Destino configurado:', this.destination);
      } else {
        console.warn('⚠️ El punto de destino no tiene coordenadas, usando punto fijo en Bogotá');
        // Punto fijo en Bogotá (Centro Internacional)
        this.destination = { lat: 4.6097, lng: -74.0817 };
      }
    } else {
      console.warn('⚠️ No se encontró destino en la actividad, usando punto fijo en Bogotá');
      // Punto fijo en Bogotá (Centro Internacional)
      this.destination = { lat: 4.6097, lng: -74.0817 };
    }
  }

  calculateRoute() {
    console.log('🛣️ Calculando ruta...');
    console.log('📍 Puntos intermedios:', this.puntos);

    const waypoints = this.puntos
      .filter((x) => x.Latitud != null && x.Longitud != null)
      .map((point) => ({
        location: new google.maps.LatLng(Number(point.Latitud), Number(point.Longitud)),
        stopover: true,
      }));

    console.log('📍 Waypoints configurados:', waypoints);

    const request: google.maps.DirectionsRequest = {
      origin: this.origin,
      destination: this.destination,
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    console.log('🛣️ Solicitud de ruta:', request);

    this.directionsService.route(request, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
      if (status === google.maps.DirectionsStatus.OK) {
        console.log('✅ Ruta calculada correctamente:', result);
        this.directionsRenderer.setDirections(result);
      } else {
        console.error('❌ Error en la solicitud de direcciones:', status);
        alert('No se pudo mostrar la ruta: ' + status);
      }
    });
  }
}
