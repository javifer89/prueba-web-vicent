import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest, map, catchError } from 'rxjs';
import { TranslationService, Locale } from '../i18n/translation.service';

export type ContentStatus = 'original' | 'translated' | 'outdated' | 'pending' | 'missing';

export interface TranslationStatus {
  ca: ContentStatus;
  es: ContentStatus;
  en: ContentStatus;
}

export interface ContentMetadata {
  id: string;
  type: string;
  translations: Record<Locale, unknown>;
  status: TranslationStatus;
  updatedAt: Record<Locale, string>;
  sourceLocale: Locale;
}

export interface EditorialContent<T = unknown> {
  metadata: ContentMetadata;
  data: T;
}

/**
 * Servicio genérico para contenido editorial multidioma.
 * 
 * El contenido editorial (biografías, noticias, eventos, composiciones, etc.)
 * se almacena en archivos JSON separados por tipo en /assets/content/
 * con estructura multidioma nativa.
 * 
 * Ejemplo estructura:
 * {
 *   "metadata": {
 *     "id": "biography-main",
 *     "type": "biography",
 *     "translations": { "ca": {...}, "es": {...}, "en": {...} },
 *     "status": { "ca": "original", "es": "translated", "en": "translated" },
 *     "updatedAt": { "ca": "2024-01-15", "es": "2024-01-16", "en": "2024-01-16" },
 *     "sourceLocale": "ca"
 *   },
 *   "data": { ...contenido específico... }
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class EditorialContentService {
  private readonly http = inject(HttpClient);
  private readonly translationService = inject(TranslationService);

  private contentCache = new Map<string, EditorialContent>();

  /**
   * Carga un contenido editorial por ID y tipo.
   * Busca en cache primero, luego en /assets/content/{type}/{id}.json
   */
  loadContent<T>(type: string, id: string): Observable<EditorialContent<T> | null> {
    const cacheKey = `${type}/${id}`;
    
    if (this.contentCache.has(cacheKey)) {
      return of(this.contentCache.get(cacheKey) as EditorialContent<T>);
    }

    return this.http.get<EditorialContent<T>>(`/assets/content/${type}/${id}.json`).pipe(
      catchError(() => {
        console.warn(`Editorial content not found: ${type}/${id}`);
        return of(null);
      }),
      map(content => {
        if (content) {
          this.contentCache.set(cacheKey, content);
        }
        return content;
      })
    );
  }

  /**
   * Obtiene el contenido ya traducido al idioma actual.
   * Si no existe la traducción en el idioma actual, usa el idioma fuente.
   */
  getLocalizedContent<T>(type: string, id: string): Observable<T | null> {
    return this.loadContent<T>(type, id).pipe(
      map(content => {
        if (!content) return null;
        
        // Obtener locale actual de forma síncrona
        const locale = this.translationService.getCurrentLocale();
        return this.extractLocalizedData(content, locale);
      })
    );
  }

  /**
   * Extrae los datos localizados del contenido editorial.
   * El JSON debe tener estructura: { metadata, data: { ca: {...}, es: {...}, en: {...} } }
   */
  private extractLocalizedData<T>(content: EditorialContent<T>, locale: Locale): T {
    const data = content.data as Record<string, unknown>;
    
    // Si data tiene keys por locale, devuelve el del locale actual
    if (data && typeof data === 'object' && (locale in data)) {
      return data[locale] as T;
    }
    
    // Fallback a idioma fuente
    const sourceLocale = content.metadata.sourceLocale;
    if (data && sourceLocale in data) {
      return data[sourceLocale] as T;
    }
    
    // Si es un objeto plano (ya filtrado), devolver tal cual
    return content.data;
  }

  /**
   * Obtiene el estado de traducción de un contenido.
   */
  getTranslationStatus(type: string, id: string): Observable<TranslationStatus | null> {
    return this.loadContent(type, id).pipe(
      map(content => content?.metadata.status || null)
    );
  }

  /**
   * Verifica si un contenido tiene traducciones pendientes/desactualizadas.
   */
  hasOutdatedTranslations(type: string, id: string): Observable<boolean> {
    return this.getTranslationStatus(type, id).pipe(
      map(status => {
        if (!status) return false;
        return Object.values(status).some(s => s === 'outdated' || s === 'pending' || s === 'missing');
      })
    );
  }

  /**
   * Lista todos los contenidos de un tipo (requiere índice o convención de nombres).
   * Para implementación futura con CMS/backend.
   */
  listContent(type: string): Observable<string[]> {
    // TODO: Implementar cuando haya backend/índice
    return of([]);
  }

  /**
   * Invalida cache para forzar recarga.
   */
  invalidateCache(type?: string, id?: string): void {
    if (type && id) {
      this.contentCache.delete(`${type}/${id}`);
    } else if (type) {
      for (const key of this.contentCache.keys()) {
        if (key.startsWith(`${type}/`)) {
          this.contentCache.delete(key);
        }
      }
    } else {
      this.contentCache.clear();
    }
  }
}