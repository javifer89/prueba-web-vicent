import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ContactService, ContactFormData, ContactResponse } from '../../core/services/contact.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  contactForm: FormGroup;
  submitStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  submitMessage = '';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private translationService: TranslationService
  ) {
    this.contactForm = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      // Honeypot field - hidden via CSS, should remain empty
      website: [''],
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  /** Labels used in about.data entries for editorial / management rows. */
  private static readonly PUBLISHER_LABELS = ['Editorial', 'Publisher'];
  private static readonly MANAGEMENT_LABELS = ['Management'];

  /** Publisher value sourced from the localized about.data entries. */
  get publisherValue(): string {
    return this.aboutDataValue(ContactComponent.PUBLISHER_LABELS);
  }

  /** Management value sourced from the localized about.data entries. */
  get managementValue(): string {
    return this.aboutDataValue(ContactComponent.MANAGEMENT_LABELS);
  }

  private aboutDataValue(labels: string[]): string {
    const data = this.translationService.getContent<{ label: string; value: string }[]>('about.data');
    return data?.find(item => labels.includes(item.label))?.value ?? '';
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    // Check honeypot - if filled, likely spam
    if (this.contactForm.value.website) {
      // Silently succeed to not reveal honeypot to bots
      this.submitStatus = 'success';
      this.submitMessage = this.translationService.translate('contact.successMessage');
      this.contactForm.reset();
      return;
    }

    this.submitStatus = 'loading';
    this.submitMessage = '';

    const formData: ContactFormData = this.contactForm.getRawValue();

    this.contactService.submitForm(formData).subscribe((response: ContactResponse) => {
      this.submitStatus = response.success ? 'success' : 'error';
      this.submitMessage = response.message;

      if (response.success) {
        this.contactForm.reset();
      }
    });
  }

  onReset(): void {
    this.contactForm.reset();
    this.submitStatus = 'idle';
    this.submitMessage = '';
  }
}