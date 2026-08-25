    import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
    import { isPlatformBrowser } from '@angular/common';
    import { HttpClient } from '@angular/common/http';
    import { Observable, of, tap, catchError } from 'rxjs';

    export type Locale = 'es' | 'ca' | 'en';

    @Injectable({ providedIn: 'root' })
    export class TranslationService {
      private http = inject(HttpClient);
      private platformId = inject(PLATFORM_ID);

      private currentLocale = signal<Locale>('es');
      private translations = signal<Record<string, unknown>>({});
      private isLoading = signal(false);

      readonly locale = computed(() => this.currentLocale());
      readonly ready = computed(() => Object.keys(this.translations()).length > 0);

      constructor() {
        this.initLocale();
      }

      private initLocale(): void {
        if (isPlatformBrowser(this.platformId)) {
          const saved = localStorage.getItem('locale') as Locale | null;
          let browserLang: Locale = 'es';
          const navLang = navigator.language.toLowerCase();
          if (navLang.startsWith('ca') || navLang.startsWith('va')) {
            browserLang = 'ca';
          } else if (navLang.startsWith('en')) {
            browserLang = 'en';
          }
          this.setLocale(saved || browserLang);
        } else {
          this.setLocale('es');
        }
      }

      setLocale(locale: Locale): void {
        const hasChanged = this.currentLocale() !== locale;
        this.currentLocale.set(locale);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('locale', locale);
        }
        // Load even when the locale did not change so the initial
        // default locale ('es') still fetches its translations.
        if (hasChanged || !this.ready()) {
          this.loadTranslations(locale);
        }
      }

      private loadTranslations(locale: Locale): void {
        this.isLoading.set(true);
        this.http.get<Record<string, unknown>>(`/locale/${locale}.json`)
          .pipe(
            tap(translations => this.translations.set(translations)),
            catchError(() => {
              this.translations.set({});
              return of({});
            })
          )
          .subscribe(() => {
            this.isLoading.set(false);
            this.applyDocumentLocale();
          });
      }

      /** Keeps <title> and <html lang> in sync with the active locale. */
      private applyDocumentLocale(): void {
        if (!isPlatformBrowser(this.platformId)) {
          return;
        }
        document.documentElement.lang = this.currentLocale();
        document.title = this.translate('meta.title');
      }

      translate(key: string, params?: Record<string, string>): string {
        const keys = key.split('.');
        let value: unknown = this.translations();

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
          } else {
            return key; // fallback to key if not found
          }
        }

        let result = String(value);

        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
          });
        }

        return result;
      }

      /**
       * Walks the translation tree like translate() but returns the raw value
       * (string, array, object...) without String() coercion. Intended for
       * long-form content such as paragraph arrays.
       */
      getContent<T = unknown>(path: string): T | undefined {
        const keys = path.split('.');
        let value: unknown = this.translations();

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
          } else {
            return undefined; // fallback if not found
          }
        }

        return value as T;
      }

      getDirection(): 'ltr' | 'rtl' {
        return 'ltr'; // all supported languages are LTR
      }
    }
