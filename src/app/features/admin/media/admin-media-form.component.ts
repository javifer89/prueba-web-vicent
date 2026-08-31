import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { MediaAdminService } from './media-admin.service';
import { Media, Category, MediaType, PlatformType } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-media-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-media-form.component.html',
  styleUrls: ['./admin-media-form.component.scss'],
})
export class AdminMediaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mediaService = inject(MediaAdminService);
  private pb = inject(PocketBaseService);

  mode: EditorMode = 'create';
  mediaId: string | null = null;
  loading = false;
  saving = false;
  error = '';
  currentLocale: 'ca' | 'es' | 'en' = 'ca';
  locales: ('ca' | 'es' | 'en')[] = ['ca', 'es', 'en'];

  form!: FormGroup;
  filePreview: string | null = null;
  coverFile: File | null = null;
  coverToDelete = false;
  categories$!: Observable<any[]>;

  typeOptions: { value: MediaType; label: string }[] = [
    { value: 'image', label: 'Imagen' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
    { value: 'document', label: 'Documento' },
  ];

  platformOptions: { value: PlatformType; label: string }[] = [
    { value: 'direct', label: 'Directo (archivo subido)' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo', label: 'Vimeo' },
    { value: 'soundcloud', label: 'SoundCloud' },
    { value: 'custom', label: 'Personalizado' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.detectMode();
  }

  private initForm(): void {
    this.form = this.fb.nonNullable.group({
      file: [null],
      title_ca: ['', Validators.required],
      title_es: [''],
      title_en: [''],
      description_ca: [''],
      description_es: [''],
      description_en: [''],
      alt_ca: [''],
      alt_es: [''],
      alt_en: [''],
      type: ['image' as MediaType, Validators.required],
      category: [''],
      date: [''],
      location: [''],
      photographer: [''],
      composer: [''],
      performer: [''],
      duration: [''],
      platform: ['direct' as PlatformType, Validators.required],
      external_url: [''],
    });
  }

  private loadCategories(): void {
    this.categories$ = this.pb.getFullList('categories', {
      sort: 'name_ca',
    });
  }

  private detectMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mode = 'edit';
      this.mediaId = id;
      this.loadMedia(id);
    }
  }

  private loadMedia(id: string): void {
    this.loading = true;
    this.mediaService.getOne(id).subscribe({
      next: (media) => this.patchForm(media),
      error: (err) => {
        this.error = 'Error cargando el archivo: ' + (err.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  private patchForm(media: Media): void {
    this.form.patchValue({
      title_ca: media.title_ca,
      title_es: media.title_es || '',
      title_en: media.title_en || '',
      description_ca: media.description_ca || '',
      description_es: media.description_es || '',
      description_en: media.description_en || '',
      alt_ca: media.alt_ca || '',
      alt_es: media.alt_es || '',
      alt_en: media.alt_en || '',
      type: media.type,
      category: media.category || '',
      date: media.date ? media.date.split('T')[0] : '',
      location: media.location || '',
      photographer: media.photographer || '',
      composer: media.composer || '',
      performer: media.performer || '',
      duration: media.duration || '',
      platform: media.platform || 'direct',
      external_url: media.external_url || '',
    });

    if (media.file) {
      this.filePreview = this.pb.getFileUrlSync(
        { id: media.id, collectionId: media.collectionId, collectionName: 'media' },
        media.file,
        { thumb: '400x400' }
      );
    }

    this.loading = false;
  }

  onFileSelect(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const type = this.form.get('type')?.value;

      // Validate file type matches selected media type
      const validTypes: Record<string, string[]> = {
        image: ['image/jpeg', 'image/png', 'image/webp'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
        video: ['video/mp4', 'video/webm'],
        pdf: ['application/pdf'],
        document: ['application/pdf'],
      };

      if (type && validTypes[type] && !validTypes[type].includes(file.type)) {
        this.error = `Tipo de archivo no válido para ${this.mediaService.getTypeLabel(type as any)}.`;
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        this.error = 'El archivo supera los 50 MB.';
        return;
      }

      this.coverFile = file;
      this.coverToDelete = false;
      this.error = '';

      // Preview for images
      if (type === 'image' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => this.filePreview = e.target?.result as string;
        reader.readAsDataURL(file);
      } else {
        this.filePreview = null;
      }
    }
  }

  removeFile(): void {
    this.coverFile = null;
    this.filePreview = null;
    this.coverToDelete = true;
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // For non-direct platforms, file is optional (external_url is required)
    const platform = this.form.get('platform')?.value;
    const file = this.form.get('file')?.value;
    const externalUrl = this.form.get('external_url')?.value;

    if (platform === 'direct' && !file && !this.coverFile && !this.coverToDelete && this.mode === 'create') {
      this.error = 'Debe subir un archivo para plataforma "Directo".';
      return;
    }

    if (platform !== 'direct' && !externalUrl) {
      this.error = 'Debe proporcionar una URL externa para esta plataforma.';
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      const formValue = this.form.getRawValue();
      const body = {
        title_ca: formValue.title_ca,
        title_es: formValue.title_es,
        title_en: formValue.title_en,
        description_ca: formValue.description_ca,
        description_es: formValue.description_es,
        description_en: formValue.description_en,
        alt_ca: formValue.alt_ca,
        alt_es: formValue.alt_es,
        alt_en: formValue.alt_en,
        type: formValue.type,
        category: formValue.category || null,
        date: formValue.date || null,
        location: formValue.location || null,
        photographer: formValue.photographer || null,
        composer: formValue.composer || null,
        performer: formValue.performer || null,
        duration: formValue.duration || null,
        platform: formValue.platform,
        external_url: formValue.external_url || null,
      };

      if (this.mode === 'create') {
        await this.mediaService.create(body).toPromise();
      } else {
        await this.mediaService.update(this.mediaId!, body).toPromise();
      }

      // Handle file upload after creating/updating record
      if (this.coverFile && this.mode === 'create') {
        // Need to get the created record ID first
        // For simplicity, we'd need to adjust the service to return the created record
      }

      await this.router.navigate(['/admin/media']);
    } catch (err: unknown) {
      const pbError = err as { response?: { data?: { message?: string } }; message?: string };
      this.error = pbError.response?.data?.message || pbError.message || 'Error guardando el archivo';
      this.saving = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/media']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }

  getTypeLabel(type: MediaType): string {
    return this.mediaService.getTypeLabel(type);
  }

  getPlatformLabel(platform: PlatformType): string {
    return this.mediaService.getPlatformLabel(platform);
  }

  onTypeChange(type: MediaType): void {
    // Method exists for template binding - type selection handled by form
  }

  onPlatformChange(platform: PlatformType): void {
    // Method exists for template binding - platform selection handled by form
    // If switching from 'direct' to external platform, show URL field
    if (platform !== 'direct') {
      this.form.get('external_url')?.setValidators([Validators.required]);
      this.form.get('external_url')?.updateValueAndValidity();
    } else {
      this.form.get('external_url')?.clearValidators();
      this.form.get('external_url')?.updateValueAndValidity();
    }
  }

  switchLocale(locale: 'ca' | 'es' | 'en'): void {
    this.currentLocale = locale;
  }
}