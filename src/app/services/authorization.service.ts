import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';

interface AuthorizationResponse {
  titulo_learning_path: string;
  actividades: {
    id_actividad: string;
    completada: boolean;
    nota: number;
    calificada: boolean;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpService) {}

  async get(): Promise<AuthorizationResponse[]> {
    return this.http.get<AuthorizationResponse[]>('/authorization/get/app');
  }

  async hasPermission(permission: string): Promise<boolean> {
    const permissions = await this.get();
    return permissions.some(path =>
      path.actividades.some(actividad => actividad.id_actividad === permission)
    );
  }

  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    const userPermissions = await this.get();
    return permissions.some(permission =>
      userPermissions.some(path =>
        path.actividades.some(actividad => actividad.id_actividad === permission)
      )
    );
  }

  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    const userPermissions = await this.get();
    return permissions.every(permission =>
      userPermissions.some(path =>
        path.actividades.some(actividad => actividad.id_actividad === permission)
      )
    );
  }
}
