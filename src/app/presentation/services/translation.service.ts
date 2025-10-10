import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly DEFAULT_LANGUAGE = 'es';

  constructor(
    private translate: TranslateService,
    private storage: StorageService
  ) {
    this.initializeLanguage();
  }

  private async initializeLanguage(): Promise<void> {
    try {
      // Set default language
      this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);

      // Try to get saved language from storage
      const savedLanguage = await this.storage.get(STORAGE.USER_LANGUAGE);
      if (savedLanguage) {
        await this.setLanguage(savedLanguage);
      } else {
        // If no saved language, use browser language or default
        const browserLang = this.translate.getBrowserLang();
        const language = browserLang?.match(/en|es/) ? browserLang : this.DEFAULT_LANGUAGE;
        await this.setLanguage(language);
      }

      console.log('Translation service initialized with language:', this.translate.currentLang);
    } catch (error) {
      console.error('Error initializing translation service:', error);
      // Fallback to default language
      await this.setLanguage(this.DEFAULT_LANGUAGE);
    }
  }

  /**
   * Set the application language
   * @param lang Language code (es|en)
   */
  async setLanguage(lang: string): Promise<void> {
    try {
      await this.translate.use(lang).toPromise();
      await this.storage.set(STORAGE.USER_LANGUAGE, lang);
      console.log('Language set to:', lang);
    } catch (error) {
      console.error('Error setting language:', error);
      throw error;
    }
  }

  /**
   * Get the current language
   * @returns Current language code
   */
  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }

  /**
   * Get available languages
   * @returns Array of available language codes
   */
  getAvailableLanguages(): string[] {
    return ['es', 'en'];
  }
}
