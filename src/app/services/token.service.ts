import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly tokenExpirationKey = 'token_expiration';

  constructor(private storage: Storage) {}

  async getToken(): Promise<string | null> {
    const token = await this.storage.get(this.tokenKey);
    const expiration = await this.storage.get(this.tokenExpirationKey);

    if (!token || !expiration) {
      return null;
    }

    if (Date.now() >= expiration - 300000) {
      return null;
    }

    return token;
  }

  async setToken(token: string, refreshToken: string): Promise<void> {
    await this.storage.set(this.tokenKey, token);
    await this.storage.set(this.refreshTokenKey, refreshToken);
    await this.storage.set(this.tokenExpirationKey, Date.now() + 3600000); // 1 hour
  }

  async getRefreshToken(): Promise<string | null> {
    return this.storage.get(this.refreshTokenKey);
  }

  async clearTokens(): Promise<void> {
    await this.storage.remove(this.tokenKey);
    await this.storage.remove(this.refreshTokenKey);
    await this.storage.remove(this.tokenExpirationKey);
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
