import { Injectable, PLATFORM_ID, inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export type Locale = 'es' | 'va' | 'en';

export interface BiographyData {
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  private currentLocaleSubject = new BehaviorSubject<Locale>('es');
  public currentLocale$ = this.currentLocaleSubject.asObservable();

  private translationsSubject = new BehaviorSubject<Record<string, string>>({});
  public translations$ = this.translationsSubject.asObservable();

  // Biography data
  private biographySubject = new BehaviorSubject<BiographyData | null>(null);
  public biography$ = this.biographySubject.asObservable();

  private readonly locales: Locale[] = ['es', 'va', 'en'];
  private readonly defaultLocale: Locale = 'va';

  // Map locale to biography file suffix - each language has its own file
  private readonly biographyFileMap: Record<Locale, string> = {
    es: 'es',  // Castellano → biografia_es.json
    va: 'va',  // Valenciano → biografia_va.json
    en: 'en',  // English → biografia_en.json
  };

  constructor() {
    this.initLocale();
  }

  private initLocale(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Priority 1: URL parameter ?lang=xx (from language switcher reload)
      const urlLang = this.getLangFromUrl();
      if (urlLang && this.locales.includes(urlLang)) {
        this.setLocale(urlLang);
        this.cleanUrlParam(); // Remove ?lang= from URL after reading
        return;
      }

      // Priority 2: localStorage (user preference)
      const saved = localStorage.getItem('locale') as Locale | null;
      if (saved && this.locales.includes(saved)) {
        this.setLocale(saved);
        return;
      }

      // Priority 3: Browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      const locale = this.locales.includes(browserLang) ? browserLang : this.defaultLocale;
      this.setLocale(locale);
    } else {
      // SSR: use default
      this.loadTranslations(this.defaultLocale);
      this.loadBiography(this.defaultLocale);
    }
  }

  private getLangFromUrl(): Locale | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    return (lang && this.locales.includes(lang as Locale)) ? lang as Locale : null;
  }

  private cleanUrlParam(): void {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('lang');
    window.history.replaceState({}, '', url.toString());
  }

  setLocale(locale: Locale): void {
    if (!this.locales.includes(locale)) {
      locale = this.defaultLocale;
    }
    this.currentLocaleSubject.next(locale);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('locale', locale);
    }
    this.loadTranslations(locale);
    this.loadBiography(locale);
  }

  getCurrentLocale(): Locale {
    return this.currentLocaleSubject.value;
  }

  getAvailableLocales(): Locale[] {
    return [...this.locales];
  }

  private loadTranslations(locale: Locale): void {
    this.http.get<Record<string, string>>(`/locale/${locale}.json`).pipe(
      catchError(() => {
        console.warn(`Failed to load locale: ${locale}, falling back to ${this.defaultLocale}`);
        if (locale !== this.defaultLocale) {
          return this.http.get<Record<string, string>>(`/locale/${this.defaultLocale}.json`);
        }
        return of({});
      }),
    ).subscribe({
      next: (translations) => {
        this.ngZone.run(() => {
          this.translationsSubject.next(this.flattenTranslations(translations));
        });
      },
      error: (err) => {
        console.error('Error loading translations:', err);
        this.ngZone.run(() => {
          this.translationsSubject.next({});
        });
      }
    });
  }

  private loadBiography(locale: Locale): void {
    const bioFile = this.biographyFileMap[locale] || 'va';
    this.http.get<{ biografia: BiographyData }>(`/locale/biografia_${bioFile}.json`).pipe(
      catchError(() => {
        console.warn(`Failed to load biography: biografia_${bioFile}.json, falling back to biografia_va.json`);
        if (bioFile !== 'va') {
          return this.http.get<{ biografia: BiographyData }>(`/locale/biografia_va.json`);
        }
        return of({ biografia: { text: '' } });
      }),
    ).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.biographySubject.next(data.biografia || { text: '' });
        });
      },
      error: (err) => {
        console.error('Error loading biography:', err);
        this.ngZone.run(() => {
          this.biographySubject.next({ text: '' });
        });
      }
    });
  }

  private flattenTranslations(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        result[newKey] = value;
      } else if (value && typeof value === 'object') {
        Object.assign(result, this.flattenTranslations(value as Record<string, unknown>, newKey));
      }
    }
    return result;
  }

  getContent(key: string): string {
    const translations = this.translationsSubject.value;
    return translations[key] || key;
  }

  getContentSync(key: string): string {
    return this.getContent(key);
  }

  getBiography(): BiographyData | null {
    return this.biographySubject.value;
  }

  /** Load default locale synchronously for APP_INITIALIZER */
  loadDefaultLocale(): Promise<void> {
    const locale = this.currentLocaleSubject.value;
    return new Promise((resolve) => {
      this.http.get<Record<string, string>>(`/locale/${locale}.json`).pipe(
        catchError(() => {
          console.warn(`Failed to load locale: ${locale}, falling back to ${this.defaultLocale}`);
          if (locale !== this.defaultLocale) {
            return this.http.get<Record<string, string>>(`/locale/${this.defaultLocale}.json`);
          }
          return of({});
        }),
      ).subscribe({
        next: (translations) => {
          this.ngZone.run(() => {
            this.translationsSubject.next(this.flattenTranslations(translations));
            this.loadBiography(locale);
            resolve();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.translationsSubject.next({});
            this.loadBiography(locale);
            resolve();
          });
        }
      });
    });
  }
}