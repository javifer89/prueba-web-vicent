import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { SiteSettingsAdminService } from '../site-settings-admin.service';
import { SiteSettings } from '../../core/services/pocketbase/models';
import { PocketBaseService } from '../../core/services/pocketbase';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-site-settings-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-site-settings-form.component.html',
  styleUrls: ['./admin-site-settings-form.component.scss'],
})
export class AdminSiteSettingsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private siteSettingsService = inject(SiteSettingsAdminService);
  private pb = inject(PocketBaseService);

  mode: EditorMode = 'create';
  siteSettingsId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  form!: FormGroup;
  logoFile: File | null = null;
  logoToDelete = false;
  logoPreview: string | null = null;
  socialLinks: any = {};

  ngOnInit(): void {
    this.initForm();
    this.detectMode();
  }

  private initForm(): void {
    this.form = this.fb.nonNullable.group({
      site_name_ca: ['', Validators.required],
      site_name_es: [''],
      site_name_en: [''],
      logo: [null],
      slogan_ca: [''],
      slogan_es: [''],
      slogan_en: [''],
      contact_email: ['', [Validators.email]],
      phone_ca: [''],
      phone_es: [''],
      phone_en: [''],
      address_ca: [''],
      address_es: [''],
      address_en: [''],
      social_facebook: [''],
      social_twitter: [''],
      social_instagram: [''],
      social_linkedin: [''],
    });
    // Initialize social links object
    this.socialLinks = {
      facebook: this.form.get('social_facebook')?.value || '',
      twitter: this.form.get('social_twitter')?.value || '',
      instagram: this.form.get('social_instagram')?.value || '',
      linkedin: this.form.get('social_linkedin')?.value || '',
    };
  }

  private detectMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mode = 'edit';
      this.siteSettingsId = id;
      this.loadSiteSettings(id);
    }
  }

  private loadSiteSettings(id: string): void {
    this.loading = true;
    this.siteSettingsService.getOne(id).subscribe({
      next: (settings) => this.patchForm(settings),
      error: (err) => {
        this.error = 'Error cargando la configuración: ' + (err.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  private patchForm(settings: SiteSettings): void {
    this.form.patchValue({
      site_name_ca: settings.site_name_ca,
      site_name_es: settings.site_name_es || '',
      site_name_en: settings.site_name_en || '',
      logo: settings.logo || null,
      slogan_ca: settings.slogan_ca || '',
      slogan_es: settings.slogan_es || '',
      slogan_en: settings.slogan_en || '',
      contact_email: settings.contact_email || '',
      phone_ca: settings.phone_ca || '',
      phone_es: settings.phone_es || '',
      phone_en: settings.phone_en || '',
      address_ca: settings.address_ca || '',
      address_es: settings.address_es || '',
      address_en: settings.address_en || '',
      social_facebook: settings.social_facebook || '',
      social_twitter: settings.social_twitter || '',
      social_instagram: settings.social_instagram || '',
      social_linkedin: settings.social_linkedin || '',
    });

    if (settings.logo) {
      this.logoPreview = this.pb.getFileUrlSync(
        { id: settings.id, collectionId: settings.collectionId, collectionName: 'site_settings' },
        settings.logo,
        { thumb: '400x400' }
      );
    }

    this.loading = false;
  }

  onFileSelect(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.logoFile = file;
      this.logoToDelete = false;
      this.error = '';

      // Preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => this.logoPreview = e.target?.result as string;
        reader.readAsDataURL(file);
      } else {
        this.logoPreview = null;
      }
    }
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
    this.logoToDelete = true;
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      const formValue = this.form.getRawValue();
      const body = {
        site_name_ca: formValue.site_name_ca,
        site_name_es: formValue.site_name_es,
        site_name_en: formValue.site_name_en,
        logo: formValue.logo || null,
        slogan_ca: formValue.slogan_ca || null,
        slogan_es: formValue.slogan_es || null,
        slogan_en: formValue.slogan_en || null,
        contact_email: formValue.contact_email || null,
        phone_ca: formValue.phone_ca || null,
        phone_es: formValue.phone_es || null,
        phone_en: formValue.phone_en || null,
        address_ca: formValue.address_ca || null,
        address_es: formValue.address_es || null,
        address_en: formValue.address_en || null,
        social_facebook: formValue.social_facebook || null,
        social_twitter: formValue.social_twitter || null,
        social_instagram: formValue.social_instagram || null,
        social_linkedin: formValue.social_linkedin || null,
      };

      if (this.mode === 'create') {
        await this.siteSettingsService.create(body).toPromise();
      } else {
        await this.siteSettingsService.update(this.siteSettingsId!, body).toPromise();
      }

      await this.router.navigate(['/admin/site-settings']);
    } catch (err: unknown) {
      const pbError = err as { response?: { data?: { message?: string } }; message?: string };
      this.error = pbError.response?.data?.message || pbError.message || 'Error guardando la configuración';
      this.saving = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/site-settings']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }
}