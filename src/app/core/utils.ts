import { INPUT_OUTPUT, STATUSES } from './constants';
import { Injectable } from '@angular/core';

/**
 * Utility functions used throughout the application
 */
@Injectable({
  providedIn: 'root'
})
export class Utils {

  // Global variables
  public static photosByMaterial: number = 2;
  public static currency: string = '$';
  public static mileage: number = 0;
  public static fuel: number = 0;
  public static quantityUnit: string = 'un';
  public static fuelUnit: string = 'gl';
  public static mileageUnit: string = 'km';
  public static weightUnit: string = 'kg';
  public static volumeUnit: string = 'lt';
  public static requestMileage: boolean = false;
  public static isClosing: boolean = false;

  constructor(
  ) {
  }


  /**
   * Generates a unique ID
   * @returns {string} A unique ID
   */
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Gets the color associated with a state
   * @param stateId The state ID to get the color for
   * @returns The color string (e.g. 'success', 'warning', 'danger', etc.)
   */
  static getStateColor(stateId: string): string {
    const estado = STATUSES.find(e => e.IdEstado === stateId);
    return estado?.Color || 'medium';
  }

  static getInputOutputAction(inputOutput: string): string {
    const acciones: Record<string, string> = {
      [INPUT_OUTPUT.INPUT]: 'Entrada',
      [INPUT_OUTPUT.OUTPUT]: 'Salida',
      [INPUT_OUTPUT.TRANSFERENCE]: 'Transferencia'
    };
    return acciones[inputOutput] || inputOutput;
  }
}
