import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { MediaAdminService, MediaType, PlatformType } from '../../../features/admin/media/media-admin.service';
import { Gallery } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-galleries-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-galleries-form.component.html',
  styleUrls: ['./admin-galleries-form.component.scss'],
})
export class AdminGalleriesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mediaService = inject(MediaAdminService);
  private pb = inject(PocketBaseService);

  mode: EditorMode = 'create';
  galleryId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  form!: FormGroup;
  filePreview: string | null = null;
  coverFile: File | null = null;
  coverToDelete = false;
  categories$!: Observable<any[]>;

  typeOptions: { value: MediaType; label: string }[] = [
    { value: 'image', label: 'Imagen' },
    { value: 'video', label: 'Video' },
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
      this.galleryId = id;
      this.loadGallery(id);
    }
  }

  private loadGallery(id: string): void {
    this.loading = true;
    this.mediaService.getOne(id).subscribe({
      next: (gallery) => this.patchForm(gallery),
      error: (err) => {
        this.error = 'Error cargando la galería: ' + (err.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  private patchForm(gallery: Gallery): void {
    this.form.patchValue({
      title_ca: gallery.title_ca,
      title_es: gallery.title_es || '',
      title_en: gallery.title_en || '',
      description_ca: gallery.description_ca || '',
      description_es: gallery.description_es || '',
      description_en: gallery.description_en || '',
      alt_ca: gallery.alt_ca || '',
      alt_es: gallery.alt_es || '',
      alt_en: gallery.alt_en || '',
      type: gallery.type,
      category: gallery.category || '',
      date: gallery.date ? gallery.date.split('T')[0] : '',
    });

    if (gallery.file) {
      this.filePreview = this.pb.getFileUrlSync(
        { id: gallery.id, collectionId: gallery.collectionId, collectionName: 'galleries' },
        gallery.file,
        { thumb: '400x400' }
      );
    }

    this.loading = false;
  }

  onFileSelect(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.coverFile = file;
      this.coverToDelete = false;
      this.error = '';

      // Preview for images
      if (file.type.startsWith('image/')) {
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
      };

      if (this.mode === 'create') {
        await this.mediaService.create(body).toPromise();
      } else {
        await this.mediaService.update(this.galleryId!, body).toPromise();
      }

      await this.router.navigate(['/admin/galleries']);
    } catch (err: unknown) {
      const pbError = err as { response?: { data?: { message?: string } }; message?: string };
      this.error = pbError.response?.data?.message || pbError.message || 'Error guardando la galería';
      this.saving = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/galleries']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }
}