import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ContactService, ContactFormData, ContactResponse } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  contactForm: FormGroup;
  submitStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  submitMessage = '';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
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

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    // Check honeypot - if filled, likely spam
    if (this.contactForm.value.website) {
      // Silently succeed to not reveal honeypot to bots
      this.submitStatus = 'success';
      this.submitMessage = 'Mensaje enviado correctamente. Te responderé pronto.';
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