import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { inject } from '@angular/core';
import { TranslationService } from '../i18n/translation.service';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  // Honeypot field - should remain empty
  website?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  // TODO: Replace with your Formspree form ID from https://formspree.io
  // Format: 'https://formspree.io/f/YOUR_FORM_ID'
  private readonly FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';

  private translationService = inject(TranslationService);

  constructor(private http: HttpClient) {}

  submitForm(data: ContactFormData): Observable<ContactResponse> {
    // Remove honeypot field before sending
    const { website, ...formData } = data;

    return this.http.post<ContactResponse>(this.FORMSPREE_ENDPOINT, formData, {
      headers: { 'Accept': 'application/json' },
    }).pipe(
      map(() => ({ success: true, message: this.translationService.translate('contact.successMessage') })),
      catchError(() => of({
        success: false,
        message: this.translationService.translate('contact.errorMessage')
      }))
    );
  }

  setEndpoint(endpoint: string): void {
    // Allow runtime configuration if needed
    (this as any).FORMSPREE_ENDPOINT = endpoint;
  }
}