import { Geolocation } from '@capacitor/geolocation';
import { GEOLOCATION, INPUT_OUTPUT, SERVICES, ERRORS,  FILES, STATUSES, STORAGE } from '../constants/constants';
import { LoggerService } from '../services/core/logger.service';
import { Injectable } from '@angular/core';
import { Platform, ToastController, LoadingController, AlertController } from '@ionic/angular';

/**
 * Utility functions used throughout the application
 */
@Injectable({
  providedIn: 'root'
})
export class Utils {
  private static logger: LoggerService;
  private static toastController: ToastController;
  private static loadingController: LoadingController;
  private static loading: HTMLIonLoadingElement;
  private static alertController: AlertController;

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
  public static _requestMileage: boolean = false;
  public static isClosing: boolean = false;

  constructor(
    private platform: Platform,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
  ) {
    Utils.toastController = toastController;
    Utils.loadingController = loadingController;
    Utils.alertController = alertController;
  }

  /**
   * Gets the current position using the device's GPS
   * @returns {Promise<[number, number]>} Tuple containing [latitude, longitude]
   * @throws {Error} If geolocation fails
   */
  static async getCurrentPosition(): Promise<[number, number]> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: GEOLOCATION.ENABLE_HIGH_ACCURACY,
        timeout: GEOLOCATION.TIMEOUT,
        maximumAge: GEOLOCATION.MAXIMUM_AGE,
      });

      return [position.coords.latitude, position.coords.longitude];
    } catch (error) {
      Utils.logger?.error('Error getting current position', error);
      throw new Error(ERRORS.GEOLOCATION);
    }
  }

  /**
   * Validates a file against the configured rules
   * @param {File} file - The file to validate
   * @returns {boolean} True if the file is valid
   */
  static validateFile(file: File): boolean {
    try {
      if (file.size > FILES.MAX_SIZE) {
        return false;
      }

      return (FILES.ALLOWED_TYPES as readonly string[]).includes(file.type);
    } catch (error) {
      Utils.logger?.error('Error validating file', error);
      return false;
    }
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

  /**
   * Present a toast message
   * @param message The message to display
   * @param position The position of the toast (top, middle, bottom)
   */
  static async showToast(message: string, position: 'top' | 'middle' | 'bottom' = 'bottom'): Promise<void> {
    const toast = await Utils.toastController.create({
      message,
      duration: 3000,
      position,
      color: 'dark'
    });
    await toast.present();
  }

  /**
   * Show a loading indicator
   * @param message The message to display in the loading indicator
   */
  static async showLoading(message: string): Promise<void> {
    Utils.loading = await Utils.loadingController.create({
      message,
      spinner: 'circular'
    });
    await Utils.loading.present();
  }

  /**
   * Hide the loading indicator
   */
  static async hideLoading(): Promise<void> {
    if (Utils.loading) {
      await Utils.loading.dismiss();
    }
  }

  /**
   * Shows an alert dialog with the specified header and message
   * @param header - The alert header text
   * @param message - The alert message text
   */
  static async showAlert(header: string, message: string): Promise<void> {
    try {
      const alert = await Utils.alertController.create({
        header,
        message,
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      Utils.logger?.error('Error showing alert', error);
    }
  }

  /**
   * Get the name of a service
   * @param serviceId The service ID
   * @returns The service name
   */
  static getServiceName(serviceId: string): string {
    const servicio = SERVICES.find(s => s.serviceId === serviceId);
    return servicio?.Name || serviceId;
  }

  /**
   * Get the action for an input/output operation
   * @param entradaSalida The input/output operation
   * @returns The action name
   */
  static getInputOutputAction(inputOutput: string): string {
    const acciones: Record<string, string> = {
      [INPUT_OUTPUT.INPUT]: 'Entrada',
      [INPUT_OUTPUT.OUTPUT]: 'Salida',
      [INPUT_OUTPUT.TRANSFERENCE]: 'Transferencia'
    };
    return acciones[inputOutput] || inputOutput;
  }

  /**
   * Check if a date is within the current work day
   * @param fechaInicial The initial date
   * @param fechaFinal The final date
   * @param fecha The date to check
   * @returns True if the date is within the work day
   */
  static verifyWorkDay(startDate: Date | null, endDate: Date | null, date: Date | null): boolean {
    if (!startDate || !endDate || !date) return false;
    return date >= startDate && date <= endDate;
  }

  /**
   * Get the image for a process
   * @param idProceso The process ID
   * @returns The image name
   */
  static getImage(idProceso: string): string {
    const images: Record<string, string> = {
      'R': 'recoleccion',
      'T': 'transporte',
      'E': 'entrega',
      'P': 'recepcion',
      'G': 'generacion'
    };
    return images[idProceso] || 'default';
  }

  /**
   * Check if mileage should be requested
   * @returns True if mileage should be requested
   */
  static get requestMileage(): boolean {
    return Utils._requestMileage;
  }

  /**
   * Set whether mileage should be requested
   * @param value Whether mileage should be requested
   */
  static set requestMileage(value: boolean) {
    Utils._requestMileage = value;
  }
}
