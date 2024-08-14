import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { ModalController, NavController } from '@ionic/angular';
import { LocationComponent } from 'src/app/components/location/location.component';
import { ActivatedRoute } from '@angular/router';
import { Globales } from 'src/app/services/globales.service';
import { Punto } from 'src/app/interfaces/punto.interface';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-mapa',
    templateUrl: './mapa.page.html',
    styleUrls: ['./mapa.page.scss'],
  })
export class MapaPage implements OnInit, AfterViewInit {
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  gresstMap !: GoogleMap;
  idActividad!: string;
  puntos: Punto[] = [];

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private globales:Globales) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad = params["IdActividad"]
    });
    this.puntos = await this.globales.getPuntosFromTareas(this.idActividad);
  }

  async ngAfterViewInit() {
    this.createMap();
  }

  async createMap() {
    const currentLocation = await Geolocation.getCurrentPosition();

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

    this.gresstMap.addMarkers(markers);
    console.log(markers);

    // this.gresstMap.setOnMarkerClickListener(async (marker) => {
    //   const modal = await this.modalCtrl.create({
    //     component: LocationComponent,
    //     componentProps: {
    //       marker,
    //     },
    //     breakpoints: [0,0,3],
    //     initialBreakpoint: 0.3,
    //   });
    //   modal.present();
    // });

    // this.gresstMap.setOnMapClickListener((position: any) => {
    //   const marker = {
    //     coordinate: {
    //       lat: position.lat,
    //       lng: position.lng,
    //     },
    //     title: 'Nuevo punto'
    //   };
    //   this.gresstMap.addMarker(marker);
    // });
  }
}
