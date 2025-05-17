export const AUTH_KEYS = {
  ACCESS_TOKEN: 'AccessToken',
  REFRESH_TOKEN: 'RefreshToken',
  USERNAME: 'Username',
  IS_LOGGED_IN: 'isLoggedIn'
};
export const AppConfig = {
  connectionTimeout: 5000,
  readTimeout: 10000
};
export enum Ajustes {
  SolicitarKilometraje = "SolicitarKilometraje",
}
export enum ClienteProveedorInterno {
  Cliente = "C",
  Proveedor = "P",
  Interno = "I"
}
export enum CRUDOperacion {
  Create = 'C',
  Update = 'U',
  Delete = 'D',
  Read = 'R'
}
export enum EntradaSalida {
  Entrada = "E",
  Salida = "S",
  Transferencia = "T",
  Ninguno = "N"
}
export enum Estado{
  Activo = "A",
  Aprobado = "A",
  Finalizado = "F",
  Pendiente = "P",
  Rechazado = "R",
  Inactivo = "I"
};
export enum Parametros {
  FotosPorMaterial = "FotosPorMaterial",
  Moneda = "Moneda",
  UnidadCantidad = "UnidadCantidad",
  UnidadCombustible = "UnidadCombustible",
  UnidadKilometraje = "UnidadKilometraje",
  UnidadPeso = "UnidadPeso",
  UnidadVolumen = "UnidadVolumen",
}
export enum Permisos{
  App = "App",
  AppCertificado = "AppCertificado",
  AppConfiguracion = "AppConfiguracion",
  AppClaseTratamiento = "AppClaseTratamiento",
  AppCuenta = "AppCuenta",
  AppDeposito = "AppDeposito",
  AppEmbalaje = "AppEmbalaje",
  AppInsumo = "AppInsumo",
  AppMaterial = "AppMaterial",
  AppPunto = "AppPunto",
  AppServicio = "AppServicio",
  AppTercero = "AppTercero",
  AppVehiculo = "AppVehiculo",
  AppAcopio = "AppAcopio",
  AppAgrupacion = "AppAgrupacion",
  AppAlmacenamiento = "AppAlmacenamiento",
  AppAprovechamiento = "AppAprovechamiento",
  AppDisposicion = "AppDisposicion",
  AppEntrega = "AppEntrega",
  AppGeneracion = "AppGeneracion",
  AppPerdida = "AppPerdida",
  AppRecepcion = "AppRecepcion",
  AppRecoleccion = "AppRecoleccion",
  AppTransformacion = "AppTransformacion",
  AppTransporte = "AppTransporte",
  AppTratamiento = "AppTratamiento",
  AppVenta = "AppVenta",
  AppBanco = "AppBanco",
  AppInventario = "AppInventario",
  AppEntrada = "AppEntrada",
  AppPublicacion = "AppPublicacion",
  AppSalida = "AppSalida",
  AppTraslado = "AppTraslado",
  AppTransferencia = "AppTransferencia",
  AppTransform = "AppTransform",
}
export enum TipoMedicion{
  Cantidad = "C",
  Peso = "P",
  Volumen = "V"
}
export enum TipoServicio {
  Almacenamiento = "1",
  Disposicion = "2",
  Pretratamiento = "3",
  Recepcion = "4",
  Aprovechamiento = "5",
  Tratamiento = "6",
  Transferencia = "7",
  Transporte = "8",
  Ajuste = "9",
  Conciliacion = "10",
  Generacion = "11",
  Acopio = "12",
  Recoleccion = "13",
  Entrega = "14",
  Perdida = "15",
  Traslado = "16"
}

export enum TipoObjeto {
  Material = "M",
  Punto = "P",
};

export const ESTADOS: { IdEstado: string, Nombre: string, Color: string }[] = [
  { IdEstado: Estado.Aprobado, Nombre: 'Aprobado', Color: 'success' },
  { IdEstado: Estado.Pendiente, Nombre: 'Pendiente', Color: 'warning' },
  { IdEstado: Estado.Rechazado, Nombre: 'Rechazado', Color: 'danger' },
  { IdEstado: Estado.Finalizado, Nombre: 'Finalizado', Color: 'secondary' },
  { IdEstado: Estado.Inactivo, Nombre: 'Opcional', Color: 'light' },
];

export const SERVICIOS: { IdServicio: string, Nombre: string, Accion: string, Icono: string }[] = [
  { IdServicio: TipoServicio.Acopio, Nombre: 'Acopio', Accion: 'Almacenamiento temporal', Icono: '../../assets/icon/warehouse.svg' },
  { IdServicio: TipoServicio.Almacenamiento, Nombre: 'Almacenamiento', Accion: 'Almacenamiento definitivo', Icono: '../../assets/icon/archive.svg' },
  { IdServicio: TipoServicio.Aprovechamiento, Nombre: 'Aprovechamiento', Accion: 'Aprovechamiento de Residuos', Icono: '../../assets/icon/sell.svg' },
  { IdServicio: TipoServicio.Pretratamiento, Nombre: 'Pretratamiento', Accion: 'Clasificación / Separación', Icono: '../../assets/icon/household.svg' },
  { IdServicio: TipoServicio.Disposicion, Nombre: 'Disposición', Accion: 'Disposición de Residuos', Icono: '../../assets/icon/fire.svg' },
  { IdServicio: TipoServicio.Generacion, Nombre: 'Generación', Accion: 'Producción', Icono: '../../assets/icon/recycle-bag.svg' },
  { IdServicio: TipoServicio.Entrega, Nombre: 'Entrega', Accion: 'Entrega', Icono: 'archive' },
  { IdServicio: TipoServicio.Recepcion, Nombre: 'Recepción', Accion: 'Recepción', Icono: 'open' },
  { IdServicio: TipoServicio.Recoleccion, Nombre: 'Recolección', Accion: 'Recolección sin vehículo', Icono: '../../assets/icon/forklift.svg' },
  { IdServicio: TipoServicio.Tratamiento, Nombre: 'Transformación', Accion: 'Transformación', Icono: '../../assets/icon/construct.svg' },
  { IdServicio: TipoServicio.Transporte, Nombre: 'Transporte', Accion: 'Transporte', Icono: '../../assets/icon/truck.svg' },
];

/**
 * Geolocation configuration
 */
export const GEOLOCATION = {
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT: 10000, // 10 seconds
  MAXIMUM_AGE: 0,
  MIN_DISTANCE: 10 // meters
}
/**
 * Global constants used throughout the application
 */
export const GLOBALS = {
  /**
   * API configuration
   */
  API: {
    URL: 'http://localhost:3000/api', // TODO: Move to environment
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  /**
   * Geolocation configuration
   */
  GEOLOCATION: {
    ENABLE_HIGH_ACCURACY: true,
    TIMEOUT: 10000, // 10 seconds
    MAXIMUM_AGE: 0,
    MIN_DISTANCE: 10 // meters
  },

    /**
   * Storage keys
   */
  STORAGE: {
    USERNAME: 'username',
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    PERMISSIONS: 'permissions',
    TRANSACTIONS: 'transactions',
    MASTER_DATA: 'master_data',
    INVENTORY: 'inventory',
  },

  /**
   * Application configuration
   */
  APP: {
    NAME: 'Gresst',
    VERSION: '1.0.0',
    DEBUG: true, // TODO: Move to environment
    OFFLINE_MODE: true,
  },

  /**
   * Error messages
   */
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'Unauthorized access. Please login again.',
    SERVER: 'Server error. Please try again later.',
    GEOLOCATION: 'Error getting location. Please check your GPS settings.',
  },

  /**
   * Success messages
   */
  MESSAGES: {
    SYNC_SUCCESS: 'Data synchronized successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    SAVE_SUCCESS: 'Data saved successfully',
  },

  /**
   * Validation rules
   */
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 32,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    PASSWORD_PATTERN: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  },

  /**
   * Date and time formats
   */
  DATETIME: {
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm:ss',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    TIMESTAMP_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  },

  /**
   * File configuration
   */
  FILES: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    MAX_FILES: 5,
  },

  /**
   * Cache configuration
   */
  CACHE: {
    ENABLED: true,
    DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_ITEMS: 100,
  },
} as const;
