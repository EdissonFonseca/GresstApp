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

  /**
   * Retrieves authorization data from the server
   * @returns {Promise<AuthorizationResponse[]>} Array of authorization responses
   * @throws {Error} If the request fails
   */
  async get(): Promise<AuthorizationResponse[]> {
    console.log('🔑 [Auth] Obteniendo autorizaciones...');
    try {
      const response = await this.http.get<AuthorizationResponse[]>('/authorization/get/app');
      console.log('✅ [Auth] Autorizaciones obtenidas exitosamente:', response.length);
      return response;
    } catch (error) {
      console.error('❌ [Auth] Error obteniendo autorizaciones:', error);
      throw error;
    }
  }

  /**
   * Checks if a user has permission for a specific action
   * @param {string} action - The action to check permission for
   * @returns {Promise<boolean>} True if user has permission
   */
  async hasPermission(action: string): Promise<boolean> {
    console.log('🔍 [Auth] Verificando permiso para acción:', action);
    try {
      const response = await this.http.get<boolean>(`/authorization/check/${action}`);
      console.log('✅ [Auth] Permiso verificado:', response);
      return response;
    } catch (error) {
      console.error('❌ [Auth] Error verificando permiso:', error);
      return false;
    }
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
