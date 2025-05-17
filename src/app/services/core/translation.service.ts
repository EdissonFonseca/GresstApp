import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANGUAGE_KEY = 'user_language';
  private readonly DEFAULT_LANGUAGE = 'es';

  constructor(
    private translate: TranslateService,
    private storage: StorageService
  ) {
    this.initializeLanguage();
  }

  private async initializeLanguage(): Promise<void> {
    // Set default language
    this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);

    // Try to get saved language from storage
    const savedLanguage = await this.storage.get(this.LANGUAGE_KEY);
    if (savedLanguage) {
      this.setLanguage(savedLanguage);
    } else {
      // If no saved language, use browser language or default
      const browserLang = this.translate.getBrowserLang();
      const language = browserLang?.match(/en|es/) ? browserLang : this.DEFAULT_LANGUAGE;
      this.setLanguage(language);
    }
  }

  /**
   * Set the application language
   * @param lang Language code (es|en)
   */
  async setLanguage(lang: string): Promise<void> {
    await this.translate.use(lang).toPromise();
    await this.storage.set(this.LANGUAGE_KEY, lang);
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
