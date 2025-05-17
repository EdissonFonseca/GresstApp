import { Geolocation } from '@capacitor/geolocation';
import { GEOLOCATION, GLOBALS, ESTADOS, CRUDOperacion, TipoServicio, EntradaSalida, SERVICIOS } from '../constants/constants';
import { LoggerService } from '../services/core/logger.service';
import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { StorageService } from '../services/core/storage.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Permisos } from '@app/constants/constants';
import { Interlocutor } from '../interfaces/interlocutor.interface';
import { MasterDataApiService } from '../services/api/masterdataApi.service';

/**
 * Utility functions used throughout the application
 */
@Injectable({
  providedIn: 'root'
})
export class Utils {
  private static logger: LoggerService;
  private static storage: StorageService;
  private static toastController: ToastController;
  private static loadingController: LoadingController;
  private static loading: HTMLIonLoadingElement;
  private static masterdataService: MasterDataApiService;

  // Global variables
  public static fotosPorMaterial: number = 2;
  public static moneda: string = '$';
  public static kilometraje: number = 0;
  public static combustible: number = 0;
  public static unidadCantidad: string = 'un';
  public static unidadCombustible: string = 'gl';
  public static unidadKilometraje: string = 'km';
  public static unidadPeso: string = 'kg';
  public static unidadVolumen: string = 'lt';
  public static solicitarKilometraje: boolean = false;
  public static estaCerrando: boolean = false;

  constructor(
    private platform: Platform,
    private storageService: StorageService,
    toastController: ToastController,
    loadingController: LoadingController,
    masterdataService: MasterDataApiService
  ) {
    Utils.initializeLogger(this.platform);
    Utils.storage = this.storageService;
    Utils.toastController = toastController;
    Utils.loadingController = loadingController;
    Utils.masterdataService = masterdataService;
  }

  private static initializeLogger(platform: Platform): void {
    if (!Utils.logger) {
      Utils.logger = new LoggerService(platform);
    }
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
      throw new Error(GLOBALS.ERRORS.GEOLOCATION);
    }
  }

  /**
   * Formats a date according to the specified format
   * @param {Date} date - The date to format
   * @param {string} format - The format to use (defaults to DATETIME_FORMAT)
   * @returns {string} The formatted date string
   */
  static formatDate(date: Date, format: string = GLOBALS.DATETIME.DATETIME_FORMAT): string {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    } catch (error) {
      Utils.logger?.error('Error formatting date', { date, format, error });
      return date.toISOString();
    }
  }

  /**
   * Validates a password against the configured rules
   * @param {string} password - The password to validate
   * @returns {boolean} True if the password is valid
   */
  static validatePassword(password: string): boolean {
    try {
      if (password.length < GLOBALS.VALIDATION.MIN_PASSWORD_LENGTH ||
          password.length > GLOBALS.VALIDATION.MAX_PASSWORD_LENGTH) {
        return false;
      }

      return new RegExp(GLOBALS.VALIDATION.PASSWORD_PATTERN).test(password);
    } catch (error) {
      Utils.logger?.error('Error validating password', error);
      return false;
    }
  }

  /**
   * Validates a username against the configured rules
   * @param {string} username - The username to validate
   * @returns {boolean} True if the username is valid
   */
  static validateUsername(username: string): boolean {
    try {
      return username.length >= GLOBALS.VALIDATION.MIN_USERNAME_LENGTH &&
             username.length <= GLOBALS.VALIDATION.MAX_USERNAME_LENGTH;
    } catch (error) {
      Utils.logger?.error('Error validating username', error);
      return false;
    }
  }

  /**
   * Validates a file against the configured rules
   * @param {File} file - The file to validate
   * @returns {boolean} True if the file is valid
   */
  static validateFile(file: File): boolean {
    try {
      if (file.size > GLOBALS.FILES.MAX_SIZE) {
        return false;
      }

      return (GLOBALS.FILES.ALLOWED_TYPES as readonly string[]).includes(file.type);
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
   * Debounces a function call
   * @param {Function} func - The function to debounce
   * @param {number} wait - The time to wait in milliseconds
   * @returns {Function} The debounced function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttles a function call
   * @param {Function} func - The function to throttle
   * @param {number} limit - The time limit in milliseconds
   * @returns {Function} The throttled function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    let lastResult: ReturnType<T>;

    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Deep clones an object
   * @param {T} obj - The object to clone
   * @returns {T} The cloned object
   */
  static deepClone<T>(obj: T): T {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      Utils.logger?.error('Error cloning object', error);
      return obj;
    }
  }

  /**
   * Checks if an object is empty
   * @param {object} obj - The object to check
   * @returns {boolean} True if the object is empty
   */
  static isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

  /**
   * Removes null or undefined values from an object
   * @param {Record<string, any>} obj - The object to clean
   * @returns {Record<string, any>} The cleaned object
   */
  static removeNullValues(obj: Record<string, any>): Record<string, any> {
    return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  /**
   * Gets the permission string for a given permission name
   * @param permissionName The name of the permission to check
   * @returns The permission string or empty string if not found
   */
  static async getPermission(permissionName: string): Promise<string> {
    const account = await Utils.storage.get('account');
    if (account?.permisos) {
      return account.permisos[permissionName] || '';
    }
    return '';
  }

  /**
   * Gets the color associated with a state
   * @param stateId The state ID to get the color for
   * @returns The color string (e.g. 'success', 'warning', 'danger', etc.)
   */
  static getStateColor(stateId: string): string {
    const estado = ESTADOS.find(e => e.IdEstado === stateId);
    return estado?.Color || 'medium';
  }

  /**
   * Present a toast message
   * @param message The message to display
   * @param position The position of the toast (top, middle, bottom)
   */
  static async presentToast(message: string, position: 'top' | 'middle' | 'bottom' = 'bottom'): Promise<void> {
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
   * Gets the current user's person ID from the account
   * @returns The person ID or undefined if not found
   */
  static async getPersonId(): Promise<string | undefined> {
    const account = await Utils.storage.get('account');
    return account?.IdPersonaCuenta;
  }

  /**
   * Generate a new unique ID
   * @returns A new unique ID
   */
  static newId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get the account from storage
   * @returns The account object
   */
  static async getCuenta(): Promise<any> {
    return await Utils.storage.get('account');
  }

  /**
   * Check if a service is allowed
   * @param serviceId The service ID to check
   * @returns True if the service is allowed
   */
  static async allowServicio(serviceId: string): Promise<boolean> {
    const account = await Utils.storage.get('account');
    return account?.servicios?.includes(serviceId) ?? false;
  }

  /**
   * Get the name of a service
   * @param serviceId The service ID
   * @returns The service name
   */
  static getNombreServicio(serviceId: string): string {
    const servicios: Record<string, string> = {
      [TipoServicio.Recoleccion]: 'Recolección',
      [TipoServicio.Transporte]: 'Transporte',
      [TipoServicio.Entrega]: 'Entrega',
      [TipoServicio.Recepcion]: 'Recepción',
      [TipoServicio.Generacion]: 'Generación'
    };
    return servicios[serviceId] || serviceId;
  }

  /**
   * Get the name of a service
   * @param serviceId The service ID
   * @returns The service name
   */
  static getServiceName(serviceId: string): string {
    const servicio = SERVICIOS.find(s => s.IdServicio === serviceId);
    return servicio?.Nombre || serviceId;
  }

  /**
   * Get the action for an input/output operation
   * @param entradaSalida The input/output operation
   * @returns The action name
   */
  static getAccionEntradaSalida(entradaSalida: string): string {
    const acciones: Record<string, string> = {
      [EntradaSalida.Entrada]: 'Entrada',
      [EntradaSalida.Salida]: 'Salida',
      [EntradaSalida.Transferencia]: 'Transferencia'
    };
    return acciones[entradaSalida] || entradaSalida;
  }

  /**
   * Check if a date is within the current work day
   * @param fechaInicial The initial date
   * @param fechaFinal The final date
   * @param fecha The date to check
   * @returns True if the date is within the work day
   */
  static verificarFechaJornada(fechaInicial: Date | null, fechaFinal: Date | null, fecha: Date | null): boolean {
    if (!fechaInicial || !fechaFinal || !fecha) return false;
    return fecha >= fechaInicial && fecha <= fechaFinal;
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
   * Check if the user has permission to add activities
   * @returns True if the user has permission to add activities
   */
  static async allowAddActivity(): Promise<boolean> {
    const acopio = (await Utils.getPermission(Permisos.AppAcopio))?.includes(CRUDOperacion.Create);
    const transporte = (await Utils.getPermission(Permisos.AppTransporte))?.includes(CRUDOperacion.Create);
    return acopio || transporte;
  }

  /**
   * Check if mileage should be requested
   * @returns True if mileage should be requested
   */
  static get requestMileage(): boolean {
    return Utils.solicitarKilometraje;
  }

  /**
   * Set whether mileage should be requested
   * @param value Whether mileage should be requested
   */
  static set requestMileage(value: boolean) {
    Utils.solicitarKilometraje = value;
  }

  /**
   * Gets interlocutors for a specific inventory item
   * @param {string} idResiduo - Inventory item ID
   * @returns {Promise<Interlocutor[]>} Array of interlocutors
   */
  static async getInterlocutors(idResiduo: string): Promise<Interlocutor[]> {
    try {
      return await Utils.masterdataService.getCounterparts(idResiduo);
    } catch (error) {
      Utils.logger.error('Error getting interlocutors', { idResiduo, error });
      throw error;
    }
  }
}
