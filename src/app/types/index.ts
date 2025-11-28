export interface UbicacionFromAPI {
  _id: string;
  nombre: string;
  posicion: {
    lat: number;
    lng: number;
  };
  direccion?: string;
  tipo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISessionResponse {
  _id: string;
  userId: string;
  token: string;
  refreshToken?: string;

  deviceInfo: {
    userAgent: string;
    ip: string;
    browser?: string;
    os?: string;
    device?: string;
    deviceType?: string;
    deviceVendor?: string;
    deviceModel?: string;
    cpuArch?: string;
    engine?: string;
    raw?: any;
  };

  location?: {
    country?: string;
    city?: string;
    lat?: number;
    lng?: number;
  };

  isActive: boolean;
  lastActivity: string;      // Date en string ISO
  expiresAt: string;         // Date en string ISO

  createdAt: string;
  updatedAt: string;
}

export interface Ubicacion {
  id: number;
  nombre: string;
  posicion: [number, number];
  description?: string;
}

export interface Fixer {
  _id: string;
  nombre: string;
  posicion: {
    lat: number;
    lng: number;
  };
  especialidad: string;
  descripcion?: string;
  rating?: number;
  whatsapp?: string;
  verified?: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}