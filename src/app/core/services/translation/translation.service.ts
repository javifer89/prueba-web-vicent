import { Injectable, inject } from '@angular/core';
import DeepL from 'deepl-node';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private client: DeepL | null = null;
  private initialized = false;

  // Initialize with DeepL API key from environment
  init(): void {
    if (this.initialized) return;

    // Get API key from environment - should be configured per deployment
    const apiKey = 'your-deepl-api-key-here';

    try {
      this.client = new DeepL(apiKey, { version: 'v2' });
      this.initialized = true;
      console.log('DeepL translation service initialized');
    } catch (error) {
      console.warn('DeepL API key not configured, falling back to i18n only');
      this.client = null;
      this.initialized = true;
    }
  }

  /**
   * Translate long text using DeepL API
   * Use for biographies, news content, descriptions, etc.
   */
  translateText(text: string, targetLang: 'ca' | 'es' | 'en' = 'ca', sourceLang: 'auto' | 'en' = 'auto'): Promise<string> {
    if (!this.client || !this.initialized) {
      // Fall back to returning original text if DeepL not initialized
      return Promise.resolve(text);
    }

    return new Promise((resolve, reject) => {
      try {
        this.client!.translateText(text, targetLang, sourceLang).then(
          (result) => {
            resolve(result.text);
          },
          (error) => {
            console.error('DeepL translation error:', error);
            // Fall back to original text on error
            resolve(text);
          }
        );
      } catch (error) {
        console.error('DeepL translation exception:', error);
        resolve(text);
      }
    });
  }

  /**
   * Translate multiple texts in parallel (for batch translation)
   * Use for translating multiple fields of a biography or news article
   */
  translateBatch(texts: { original: string; targetLang: 'ca' | 'es' | 'en'; sourceLang?: 'auto' | 'en' }[]): Promise<string[]> {
    if (!this.client || !this.initialized) {
      return Promise.resolve(texts.map(() => ''));
    }

    return new Promise((resolve, reject) => {
      try {
        const requests = texts.map(({ original, targetLang, sourceLang }) =>
          this.translateText(original, targetLang, sourceLang)
        );

        Promise.all(requests).then(results => {
          resolve(results);
        });
      } catch (error) {
        console.error('DeepL batch translation error:', error);
        resolve(texts.map(() => ''));
      }
    });
  }

  /**
   * Short translation for navigation, labels, buttons
   * Uses i18n pipeline for consistency with Angular i18n
   * Keeps i18n keys for SEO and consistency
   */
  async translateShort(key: string, lang: 'ca' | 'es' | 'en' = 'ca'): Promise<string> {
    // For short texts, we rely on the Angular i18n system
    // This method is a placeholder - actual translation happens via translate pipe
    // The key is returned as-is, the template uses [translate] directive
    return Promise.resolve(key);
  }

  /**
   * Detect if text is likely long content that should use DeepL
   * Short texts (labels, navigation, button text) should use i18n
   * Long texts (biographies, articles, descriptions) should use DeepL
   */
  isLongText(text: string): boolean {
    // Heuristic: texts longer than 200 characters are likely long-form content
    // that should use DeepL rather than i18n keys
    return text.trim().length > 200;
  }

  /**
   * Main translation entry point - auto-selects between DeepL and i18n
   * - Short texts (< 200 chars): returns i18n key for template to handle
   * - Long texts (> 200 chars): uses DeepL API
   */
  async translate(content: string, targetLang: 'ca' | 'es' | 'en' = 'ca'): Promise<string> {
    if (this.isLongText(content)) {
      return this.translateText(content, targetLang);
    } else {
      // For short texts, return the key - template uses i18n pipe
      return Promise.resolve(content);
    }
  }
}