import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { SiteSettingsAdminService } from './site-settings-admin.service';
import { SiteSettings } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-site-settings-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './site-settings-admin-form.component.html',
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
  ogImageFile: File | null = null;
  ogImageToDelete = false;
  ogImagePreview: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.detectMode();
  }

  private initForm(): void {
    this.form = this.fb.nonNullable.group({
      hero_title_ca: ['', Validators.required],
      hero_title_es: [''],
      hero_title_en: [''],
      hero_subtitle_ca: ['', Validators.required],
      hero_subtitle_es: [''],
      hero_subtitle_en: [''],
      site_name: ['', Validators.required],
      site_description_ca: ['', Validators.required],
      site_description_es: [''],
      site_description_en: [''],
      og_default_image: [null],
      contact_email: ['', [Validators.email]],
      contact_formspree_id: [''],
      social_links: [{}],
    });
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
      hero_title_ca: settings.hero_title_ca,
      hero_title_es: settings.hero_title_es || '',
      hero_title_en: settings.hero_title_en || '',
      hero_subtitle_ca: settings.hero_subtitle_ca,
      hero_subtitle_es: settings.hero_subtitle_es || '',
      hero_subtitle_en: settings.hero_subtitle_en || '',
      site_name: settings.site_name,
      site_description_ca: settings.site_description_ca,
      site_description_es: settings.site_description_es || '',
      site_description_en: settings.site_description_en || '',
      og_default_image: settings.og_default_image || null,
      contact_email: settings.contact_email || '',
      contact_formspree_id: settings.contact_formspree_id || '',
      social_links: settings.social_links || {},
    });

    if (settings.og_default_image) {
      this.ogImagePreview = this.pb.getFileUrlSync(
        { id: settings.id, collectionId: settings.collectionId, collectionName: 'site_settings' },
        settings.og_default_image,
        { thumb: '400x400' }
      );
    }

    this.loading = false;
  }

  onFileSelect(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.ogImageFile = file;
      this.ogImageToDelete = false;
      this.error = '';

      // Preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => this.ogImagePreview = e.target?.result as string;
        reader.readAsDataURL(file);
      } else {
        this.ogImagePreview = null;
      }
    }
  }

  removeOgImage(): void {
    this.ogImageFile = null;
    this.ogImagePreview = null;
    this.ogImageToDelete = true;
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
        hero_title_ca: formValue.hero_title_ca,
        hero_title_es: formValue.hero_title_es,
        hero_title_en: formValue.hero_title_en,
        hero_subtitle_ca: formValue.hero_subtitle_ca,
        hero_subtitle_es: formValue.hero_subtitle_es,
        hero_subtitle_en: formValue.hero_subtitle_en,
        site_name: formValue.site_name,
        site_description_ca: formValue.site_description_ca,
        site_description_es: formValue.site_description_es,
        site_description_en: formValue.site_description_en,
        og_default_image: formValue.og_default_image || null,
        contact_email: formValue.contact_email || null,
        contact_formspree_id: formValue.contact_formspree_id || null,
        social_links: formValue.social_links || {},
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