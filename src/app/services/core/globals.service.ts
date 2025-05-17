import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalsService {
  public fotosPorMaterial: number = 2;
  public moneda: string = '$';
  public kilometraje: number = 0;
  public combustible: number = 0;
  public unidadCantidad: string = 'un';
  public unidadCombustible: string = 'gl';
  public unidadKilometraje: string = 'km';
  public unidadPeso: string = 'kg';
  public unidadVolumen: string = 'lt';
  public solicitarKilometraje: boolean = false;
  public estaCerrando = false;
}
