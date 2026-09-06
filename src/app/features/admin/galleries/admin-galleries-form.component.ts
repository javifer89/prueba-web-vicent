import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { GalleryAdminService } from './galleries-admin.service';
import { Gallery } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-galleries-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-galleries-form.component.html',
})
export class AdminGalleriesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private galleryService = inject(GalleryAdminService);
  private pb = inject(PocketBaseService);

  mode: EditorMode = 'create';
  galleryId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  form!: FormGroup;
  coverPreview: string | null = null;
  coverFile: File | null = null;
  coverToDelete = false;

  statusOptions: { value: 'draft' | 'published' | 'archived'; label: string }[] = [
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicado' },
    { value: 'archived', label: 'Archivado' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.detectMode();
  }

  private initForm(): void {
    this.form = this.fb.nonNullable.group({
      cover: [null],
      title_ca: ['', Validators.required],
      title_es: [''],
      title_en: [''],
      description_ca: [''],
      description_es: [''],
      description_en: [''],
      status: ['draft' as const, Validators.required],
      featured: [false],
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
    this.galleryService.getOne(id).subscribe({
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
      status: gallery.status,
      featured: gallery.featured,
    });

    if (gallery.cover) {
      this.coverPreview = this.pb.getFileUrlSync(
        { id: gallery.id, collectionId: gallery.collectionId, collectionName: 'galleries' },
        gallery.cover,
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
        reader.onload = (e) => this.coverPreview = e.target?.result as string;
        reader.readAsDataURL(file);
      } else {
        this.coverPreview = null;
      }
    }
  }

  removeCover(): void {
    this.coverFile = null;
    this.coverPreview = null;
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
        status: formValue.status,
        featured: formValue.featured,
      };

      if (this.mode === 'create') {
        await this.galleryService.create(body).toPromise();
      } else {
        await this.galleryService.update(this.galleryId!, body).toPromise();
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