export const AUTH_KEYS = {
  ACCESS_TOKEN: 'AccessToken',
  REFRESH_TOKEN: 'RefreshToken',
  USERNAME: 'Username',
  IS_LOGGED_IN: 'isLoggedIn'
};
export const THIRD_PARTY_TYPES = {
  CLIENT: "C",
  SUPPLIER: "P",
  INTERNAL: "I"
}
export const CRUD_OPERATIONS = {
  CREATE: 'C',
  UPDATE: 'U',
  DELETE: 'D',
  READ: 'R'
}
export const INPUT_OUTPUT = {
  INPUT: "E",
  OUTPUT: "S",
  TRANSFERENCE: "T",
  NONE: "N"
}
export const STATUS = {
  ACTIVE: "A",
  APPROVED: "A",
  FINISHED: "F",
  PENDING: "P",
  REJECTED: "R",
  INACTIVE: "I"
}
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
export const MEASUREMENTS = {
  QUANTITY: "C",
  WEIGHT: "P",
  VOLUME: "V"
}
export const SERVICE_TYPES = {
  STORAGE: "1",
  DISPOSAL: "2",
  PRE_TREATMENT: "3",
  RECEPTION: "4",
  RECOVERY: "5",
  TREATMENT: "6",
  TRANSFERENCE: "7",
  TRANSPORT: "8",
  ADJUSTMENT: "9",
  CONCILIATION: "10",
  GENERATION: "11",
  RELOCATION: "12",
  DELIVERY: "13",
  SELL: "14",
  LOSS: "15",
  STOCK_PILLING: "16",
  ACCUMULATION: "17",
  COLLECTION: "18"
}

export const STATUSES: { IdEstado: string, Nombre: string, Color: string }[] = [
  { IdEstado: STATUS.APPROVED, Nombre: 'Aprobado', Color: 'success' },
  { IdEstado: STATUS.PENDING, Nombre: 'Pendiente', Color: 'warning' },
  { IdEstado: STATUS.REJECTED, Nombre: 'Rechazado', Color: 'danger' },
  { IdEstado: STATUS.FINISHED, Nombre: 'Finalizado', Color: 'secondary' },
  { IdEstado: STATUS.INACTIVE, Nombre: 'Opcional', Color: 'light' },
];

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
 * Geolocation configuration
 */
export const GEOLOCATION = {
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT: 10000, // 10 seconds
  MAXIMUM_AGE: 0,
  MIN_DISTANCE: 10 // meters
}

/**
 * Storage keys
 */
export const STORAGE= {
  USERNAME: 'username',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  PERMISSIONS: 'permissions',
  TRANSACTIONS: 'transactions',
  MASTER_DATA: 'master_data',
  INVENTORY: 'inventory',
}

  /**
   * Error messages
   */
  export const ERRORS= {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'Unauthorized access. Please login again.',
    SERVER: 'Server error. Please try again later.',
    GEOLOCATION: 'Error getting location. Please check your GPS settings.',
  }

  /**
   * Validation rules
   */
  export const VALIDATION= {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 32,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    PASSWORD_PATTERN: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  }

  /**
   * Date and time formats
   */
  export const DATETIME= {
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm:ss',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    TIMESTAMP_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  }

  /**
   * File configuration
   */
  export const FILES= {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    MAX_FILES: 5,
  }
