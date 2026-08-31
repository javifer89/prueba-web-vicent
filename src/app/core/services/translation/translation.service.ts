import { Injectable, inject } from '@angular/core';
import { PocketBaseService } from '../pocketbase/pocketbase.service';
import { TranslationStatus, Locale } from '../core/services/pocketbase/models';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private pb = inject(PocketBaseService);

  /**
   * Translation status constants
   */
  TranslationStatus = TranslationStatus;

  /**
   * Supported locales
   */
  SupportedLocales: Locale[] = ['ca', 'es', 'en'];

  /**
   * Check if a translation exists for a record field and language
   * Reads from PocketBase only - NO API calls
   */
  async existsTranslation(
    recordId: string,
    collection: string,
    field: string,
    lang: Locale
  ): Promise<{
    exists: boolean;
    text: string;
    status: TranslationStatus;
  }> {
    try {
      const record = await this.pb.getOne(collection, recordId, {
        expand: false,
      });

      const textKey = `${field}_${lang}`;
      const text = record[textKey as keyof typeof record] as string | undefined;
      const statusKey = `translation_status_${lang}`;
      const status = record[statusKey as keyof typeof record] as TranslationStatus | 'missing';

      return {
        exists: !!text,
        text: text || '',
        status: status,
      };
    } catch (error) {
      console.error('Error checking translation existence:', error);
      return {
        exists: false,
        text: '',
        status: 'missing',
      };
    }
  }

  /**
   * Get translated text for public frontend
   * Reads from PocketBase only - NO API calls, NO translation
   */
  async getTranslatedText(
    recordId: string,
    collection: string,
    field: string,
    lang: Locale
  ): Promise<string> {
    try {
      const record = await this.pb.getOne(collection, recordId, {
        expand: false,
      });

      const textKey = `${field}_${lang}`;
      const text = record[textKey as keyof typeof record] as string | undefined;

      if (text && text.trim().length > 0) {
        return text;
      }

      // Fallback: return original language or empty
      const originalKey = `${field}_ca`;
      const originalText = record[originalKey as keyof typeof record] as string | undefined;
      return originalText || text || '';
    } catch (error) {
      console.error('Error getting translated text:', error);
      return '';
    }
  }

  /**
   * Get all translated fields for a record and language
   * Public frontend use only
   */
  async getAllTranslatedFields(
    recordId: string,
    collection: string,
    fieldPrefix: string,
    lang: Locale
  ): Promise<{
    hasTranslation: boolean;
    translatedText: string;
    originalText: string;
  }> {
    try {
      const record = await this.pb.getOne(collection, recordId, {
        expand: false,
      });

      const translatedKey = `${fieldPrefix}_${lang}`;
      const originalKey = fieldPrefix;

      const hasTranslation = !!(
        record[translatedKey as keyof typeof record] as string
      );

      const translatedText = hasTranslation
        ? (record[translatedKey as keyof typeof record] as string)
        : '';

      const originalText = hasTranslation
        ? ''
        : (record[originalKey as keyof typeof record] as string) || '';

      return {
        hasTranslation,
        translatedText,
        originalText,
      };
    } catch (error) {
      console.error('Error getting all translated fields:', error);
      return {
        hasTranslation: false,
        translatedText: '',
        originalText: '',
      };
    }
  }

  /**
   * Get translation status for a record
   */
  async getRecordTranslationStatus(
    recordId: string,
    collection: string,
    fieldPrefixes: string[]
  ): Promise<Record<string, TranslationStatus>> {
    try {
      const record = await this.pb.getOne(collection, recordId, {
        expand: false,
      });

      const statuses: Record<string, TranslationStatus> = {};

      for (const prefix of fieldPrefixes) {
        for (const lang of this.SupportedLocales) {
          const statusKey = `${prefix}_${lang}`;
          if (record[statusKey as keyof typeof record]) {
            statuses[statusKey] = record[statusKey as keyof typeof record] as TranslationStatus;
          } else {
            statuses[statusKey] = 'missing';
          }
        }
      }

      return statuses;
    } catch (error) {
      console.error('Error getting record translation status:', error);
      return {};
    }
  }

  /**
   * Mark translation as outdated when original content changes
   * Admin operation - saves status to PocketBase
   */
  async markAsOutdated(
    recordId: string,
    collection: string,
    field: string,
    lang: Locale
  ): Promise<{
    success: boolean;
    newStatus: TranslationStatus;
  }> {
    try {
      await this.pb.update(collection, recordId, {
        [`translation_status_${lang}`]: 'outdated' as TranslationStatus,
      });

      return {
        success: true,
        newStatus: 'outdated' as TranslationStatus,
      };
    } catch (error) {
      console.error('Error marking translation as outdated:', error);
      return {
        success: false,
        newStatus: 'missing' as TranslationStatus,
      };
    }
  }

  /**
   * Helper: Validate that all required languages have content
   * Useful for admin forms before saving
   */
  validateLanguageCoverage(
    formValues: Record<string, any>,
    fieldPrefix: string
  ): {
    complete: boolean;
    missingLangs: Locale[];
    hasOriginal: boolean;
  } {
    const missingLangs: Locale[] = [];
    const supportedLangs: Locale[] = ['ca', 'es', 'en'];
    let hasOriginal = false;

    for (const lang of supportedLangs) {
      const value = formValues[`${fieldPrefix}_${lang}`];
      if (value && value.trim().length > 0) {
        // Has content in this language
      } else {
        missingLangs.push(lang);
      }
      // Check if original (ca) has content
      if (lang === 'ca' && (formValues[`${fieldPrefix}_ca`] || '').trim().length > 0) {
        hasOriginal = true;
      }
    }

    return {
      complete: missingLangs.length === 0,
      missingLangs,
      hasOriginal,
    };
  }
}