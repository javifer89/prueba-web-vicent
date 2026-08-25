import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeCa from '@angular/common/locales/ca';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';

// Locale data for DatePipe-based formatting (see LocalizedDatePipe).
registerLocaleData(localeEs);
registerLocaleData(localeCa);
registerLocaleData(localeEn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};