/**
 * CRUD (Create, Read, Update, Delete) operation types
 * Used to identify the type of operation being performed on data
 */
export const CRUD_OPERATIONS = {
  CREATE: 'C',
  UPDATE: 'U',
  DELETE: 'D',
  READ: 'R'
}

/**
 * Date and time formats used throughout the application
 * Standardizes date and time display and storage formats
 */
export const DATETIME= {
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  TIMESTAMP_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
}

/**
 * Standard error messages for common application errors
 * Used for consistent error handling and user feedback
 */
export const ERRORS= {
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  SERVER: 'Server error. Please try again later.',
  GEOLOCATION: 'Error getting location. Please check your GPS settings.',
}

/**
 * File upload configuration settings
 * Defines limits and restrictions for file uploads
 */
export const FILES= {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_FILES: 5,
}

/**
 * Geolocation configuration settings
 * Controls the behavior of location services
 */
export const GEOLOCATION = {
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT: 10000, // 10 seconds
  MAXIMUM_AGE: 0,
  MIN_DISTANCE: 10 // meters
}

/**
 * Input/Output operation types
 * Defines the types of material flow operations
 */
export const INPUT_OUTPUT = {
  INPUT: "E",      // Entrada (Input)
  OUTPUT: "S",     // Salida (Output)
  TRANSFERENCE: "T", // Transferencia (Transference)
  NONE: "N"        // Ninguno (None)
}

/**
 * Measurement types for materials
 * Defines how materials are measured
 */
export const MEASUREMENTS = {
  QUANTITY: "C",   // Cantidad (Quantity)
  WEIGHT: "P",     // Peso (Weight)
  VOLUME: "V"      // Volumen (Volume)
}

/**
 * Application permission keys
 * Defines the permissions required for different application features
 */
export const PERMISSIONS = {
  APP: "App",
  APP_CERTIFICATE: "AppCertificado",
  APP_CONFIGURATION: "AppConfiguracion",
  APP_TREATMENT_CLASS: "AppClaseTratamiento",
  APP_ACCOUNT: "AppCuenta",
  APP_DEPOSIT: "AppDeposito",
  APP_PACKAGE: "AppEmbalaje",
  APP_SUPPLY: "AppInsumo",
  APP_MATERIAL: "AppMaterial",
  APP_POINT: "AppPunto",
  APP_SERVICE: "AppServicio",
  APP_THIRD_PARTY: "AppTercero",
  APP_VEHICLE: "AppVehiculo",
  APP_COLLECTION: "AppRecoleccion",
  APP_GROUP: "AppAgrupacion",
  APP_STORAGE: "AppAlmacenamiento",
  APP_APPROVE: "AppAprovechamiento",
  APP_DISPOSITION: "AppDisposicion",
  APP_DELIVERY: "AppEntrega",
  APP_GENERATION: "AppGeneracion",
  APP_LOSS: "AppPerdida",
  APP_RECEPTION: "AppRecepcion",
  APP_RECOLLECTION: "AppRecoleccion",
  APP_TRANSFORMATION: "AppTransformacion",
  APP_TRANSPORT: "AppTransporte",
  APP_TREATMENT: "AppTratamiento",
  APP_SALE: "AppVenta",
  APP_BANK: "AppBanco",
  APP_INVENTORY: "AppInventario",
  APP_ENTRY: "AppEntrada",
  APP_PUBLICATION: "AppPublicacion",
  APP_OUTPUT: "AppSalida",
  APP_TRANSFER: "AppTraslado",
  APP_TRANSFERENCE: "AppTransferencia",
  APP_TRANSFORM: "AppTransform",
}

/**
 * Status codes for various entities
 * Defines the possible states of items in the system
 */
export const STATUS = {
  ACTIVE: "A",     // Activo (Active)
  APPROVED: "A",   // Aprobado (Approved)
  FINISHED: "F",   // Finalizado (Finished)
  PENDING: "P",    // Pendiente (Pending)
  REJECTED: "R",   // Rechazado (Rejected)
  INACTIVE: "I"    // Inactivo (Inactive)
}

/**
 * Third party types
 * Defines the different types of third parties in the system
 */
export const THIRD_PARTY_TYPES = {
  CLIENT: "C",     // Cliente (Client)
  SUPPLIER: "P",   // Proveedor (Supplier)
  INTERNAL: "I"    // Interno (Internal)
}

/**
 * Service type codes
 * Defines the different types of services available in the system
 */
export const SERVICE_TYPES = {
  STORAGE: "1",           // Almacenamiento (Storage)
  DISPOSAL: "2",          // Disposición (Disposal)
  PRE_TREATMENT: "3",     // Pretratamiento (Pre-treatment)
  RECEPTION: "4",         // Recepción (Reception)
  RECOVERY: "5",          // Recuperación (Recovery)
  TREATMENT: "6",         // Tratamiento (Treatment)
  TRANSFERENCE: "7",      // Transferencia (Transference)
  TRANSPORT: "8",         // Transporte (Transport)
  ADJUSTMENT: "9",        // Ajuste (Adjustment)
  CONCILIATION: "10",     // Conciliación (Conciliation)
  GENERATION: "11",       // Generación (Generation)
  RELOCATION: "12",       // Reubicación (Relocation)
  DELIVERY: "13",         // Entrega (Delivery)
  SELL: "14",             // Venta (Sell)
  LOSS: "15",             // Pérdida (Loss)
  STOCK_PILLING: "16",    // Acopio (Stock pilling)
  ACCUMULATION: "17",     // Acumulación (Accumulation)
  COLLECTION: "18"        // Recolección (Collection)
}

/**
 * Service definitions with metadata
 * Contains detailed information about each service type
 */
export const SERVICES: { serviceId: string, Name: string, Action: string, Icon: string }[] = [
  { serviceId: SERVICE_TYPES.STOCK_PILLING, Name: 'Acopio', Action: 'Almacenamiento temporal', Icon: '../../assets/icon/warehouse.svg' },
  { serviceId: SERVICE_TYPES.STORAGE, Name: 'Almacenamiento', Action: 'Almacenamiento definitivo', Icon: '../../assets/icon/archive.svg' },
  { serviceId: SERVICE_TYPES.RECOVERY, Name: 'Aprovechamiento', Action: 'Aprovechamiento de Residuos', Icon: '../../assets/icon/sell.svg' },
  { serviceId: SERVICE_TYPES.PRE_TREATMENT, Name: 'Pretratamiento', Action: 'Clasificación / Separación', Icon: '../../assets/icon/household.svg' },
  { serviceId: SERVICE_TYPES.DISPOSAL, Name: 'Disposición', Action: 'Disposición de Residuos', Icon: '../../assets/icon/fire.svg' },
  { serviceId: SERVICE_TYPES.GENERATION, Name: 'Generación', Action: 'Producción', Icon: '../../assets/icon/recycle-bag.svg' },
  { serviceId: SERVICE_TYPES.DELIVERY, Name: 'Entrega', Action: 'Entrega', Icon: 'archive' },
  { serviceId: SERVICE_TYPES.RECEPTION, Name: 'Recepción', Action: 'Recepción', Icon: 'open' },
  { serviceId: SERVICE_TYPES.COLLECTION, Name: 'Recolección', Action: 'Recolección sin vehículo', Icon: '../../assets/icon/forklift.svg' },
  { serviceId: SERVICE_TYPES.TREATMENT, Name: 'Tratamiento', Action: 'Transformación', Icon: '../../assets/icon/construct.svg' },
  { serviceId: SERVICE_TYPES.TRANSPORT, Name: 'Transporte', Action: 'Transporte', Icon: '../../assets/icon/truck.svg' },
];

/**
 * Status definitions with display properties
 * Contains metadata for displaying different statuses in the UI
 */
export const STATUSES: { IdEstado: string, Nombre: string, Color: string }[] = [
  { IdEstado: STATUS.APPROVED, Nombre: 'Aprobado', Color: 'success' },
  { IdEstado: STATUS.PENDING, Nombre: 'Pendiente', Color: 'warning' },
  { IdEstado: STATUS.REJECTED, Nombre: 'Rechazado', Color: 'danger' },
  { IdEstado: STATUS.FINISHED, Nombre: 'Finalizado', Color: 'secondary' },
  { IdEstado: STATUS.INACTIVE, Nombre: 'Opcional', Color: 'light' },
];

/**
 * Storage keys for local data persistence
 * Defines the keys used for storing data in local storage
 */
export const STORAGE = {
  ACCESS_TOKEN: 'AccessToken',
  ACCOUNT: 'Account',
  ACTIVITIES: 'Activities',
  EMAIL: 'Email',
  FULLNAME: 'Fullname',
  INVENTORY: 'Inventory',
  IS_LOGGED_IN: 'IsLoggedIn',
  MASTER_DATA: 'MasterData',
  MATERIALS: 'Materials',
  PACKAGES: 'Packages',
  PERMISSIONS: 'Permissions',
  POINTS: 'Points',
  REFRESH_TOKEN: 'RefreshToken',
  SERVICES: 'Services',
  SUPPLIES: 'Supplies',
  TRANSACTION: 'Transaction',
  THIRD_PARTIES: 'ThirdParties',
  TREATMENTS: 'Treatments',
  USERNAME: 'Username',
  USER_LANGUAGE: 'UserLanguage',
  VEHICLES: 'Vehicles',
  VERIFICATION_CODE: 'Code',
}

/**
 * Validation rules for user input
 * Defines constraints for password and username fields
 */
export const VALIDATION= {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 32,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  PASSWORD_PATTERN: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
}