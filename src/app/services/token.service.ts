import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly tokenKey = 'AccessToken';
  private readonly refreshTokenKey = 'RefreshToken';
  private readonly usernameKey = 'Username';

  constructor(private storage: Storage) {}

  /**
   * Retrieves the stored access token
   * @returns {Promise<string | null>} The stored access token or null if not found
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await this.storage.get(this.tokenKey);
      console.log('🔍 [Token] Buscando token con clave:', this.tokenKey);
      console.log('🔍 [Token] Token encontrado:', token ? 'Sí' : 'No');

      if (!token) {
        return null;
      }

      // Decodificar el token JWT para obtener la expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convertir a milisegundos

      if (Date.now() >= expiration - 300000) { // 5 minutos antes de expirar
        console.log('⚠️ [Token] Token expirado o próximo a expirar');
        return null;
      }

      return token;
    } catch (error) {
      console.error('❌ [Token] Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Stores the access token, refresh token, and username
   * @param {string} token - The access token to store
   * @param {string} refreshToken - The refresh token to store
   * @param {string} username - The username to store
   */
  async setToken(token: string, refreshToken: string, username: string): Promise<void> {
    console.log('💾 [Token] Guardando tokens para usuario:', username);
    console.log('💾 [Token] Usando claves:', {
      tokenKey: this.tokenKey,
      refreshTokenKey: this.refreshTokenKey,
      usernameKey: this.usernameKey
    });

    try {
      // Guardar todos los tokens en paralelo
      await Promise.all([
        this.storage.set(this.tokenKey, token),
        this.storage.set(this.refreshTokenKey, refreshToken),
        this.storage.set(this.usernameKey, username)
      ]);

      // Verificar que se guardaron correctamente
      const savedToken = await this.storage.get(this.tokenKey);
      const savedRefreshToken = await this.storage.get(this.refreshTokenKey);
      const savedUsername = await this.storage.get(this.usernameKey);

      console.log('✅ [Token] Verificación después de guardar:', {
        token: savedToken ? 'Guardado' : 'No guardado',
        refreshToken: savedRefreshToken ? 'Guardado' : 'No guardado',
        username: savedUsername ? 'Guardado' : 'No guardado'
      });

      if (!savedToken || !savedRefreshToken || !savedUsername) {
        throw new Error('Error verificando tokens guardados');
      }

      console.log('✅ [Token] Tokens guardados exitosamente');
    } catch (error) {
      console.error('❌ [Token] Error guardando tokens:', error);
      throw error;
    }
  }

  /**
   * Retrieves the stored refresh token
   * @returns {Promise<string | null>} The stored refresh token or null if not found
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await this.storage.get(this.refreshTokenKey);
      console.log('🔍 [Token] Refresh token encontrado:', token ? 'Sí' : 'No');
      return token;
    } catch (error) {
      console.error('❌ [Token] Error obteniendo refresh token:', error);
      return null;
    }
  }

  /**
   * Retrieves the stored username
   * @returns {Promise<string | null>} The stored username or null if not found
   */
  async getUsername(): Promise<string | null> {
    try {
      const username = await this.storage.get(this.usernameKey);
      console.log('🔍 [Token] Username encontrado:', username ? 'Sí' : 'No');
      return username;
    } catch (error) {
      console.error('❌ [Token] Error obteniendo username:', error);
      return null;
    }
  }

  /**
   * Clears all stored tokens
   */
  async clearTokens(): Promise<void> {
    console.log('🧹 [Token] Limpiando tokens...');
    try {
      await this.storage.remove(this.tokenKey);
      await this.storage.remove(this.refreshTokenKey);
      await this.storage.remove(this.usernameKey);
      console.log('✅ [Token] Tokens limpiados exitosamente');
    } catch (error) {
      console.error('❌ [Token] Error limpiando tokens:', error);
      throw error;
    }
  }

  async hasValidToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  async hasRefreshToken(): Promise<boolean> {
    const refreshToken = await this.getRefreshToken();
    return refreshToken !== null;
  }
}
