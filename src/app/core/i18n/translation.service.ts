import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export type Locale = 'es' | 'ca' | 'en';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private currentLocaleSubject = new BehaviorSubject<Locale>('es');
  public currentLocale$ = this.currentLocaleSubject.asObservable();

  private translationsSubject = new BehaviorSubject<Record<string, string>>({});
  public translations$ = this.translationsSubject.asObservable();

  private readonly locales: Locale[] = ['es', 'ca', 'en'];
  private readonly defaultLocale: Locale = 'es';

  constructor() {
    this.initLocale();
  }

  private initLocale(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('locale') as Locale | null;
      if (saved && this.locales.includes(saved)) {
        this.setLocale(saved);
      } else {
        const browserLang = navigator.language.split('-')[0] as Locale;
        const locale = this.locales.includes(browserLang) ? browserLang : this.defaultLocale;
        this.setLocale(locale);
      }
    } else {
      this.loadTranslations(this.defaultLocale);
    }
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
    ).subscribe(translations => {
      this.translationsSubject.next(this.flattenTranslations(translations));
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
}