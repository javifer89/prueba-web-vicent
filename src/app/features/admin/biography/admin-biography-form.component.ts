import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { BiographyAdminService } from '../biography-admin.service';
import { Biography } from '../../core/services/pocketbase/models';
import { PocketBaseService } from '../../core/services/pocketbase';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-biography-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-biography-form.component.html',
  styleUrls: ['./admin-biography-form.component.scss'],
})
export class AdminBiographyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private biographyService = inject(BiographyAdminService);
  private pb = inject(PocketBaseService);

  mode: EditorMode = 'create';
  biographyId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  form!: FormGroup;
  portraitFile: File | null = null;
  portraitToDelete = false;
  portraitPreview: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.detectMode();
  }

  private initForm(): void {
    this.form = this.fb.nonNullable.group({
      portrait: [null],
      name_ca: ['', Validators.required],
      name_es: [''],
      name_en: [''],
      birth_year: [null, [Validators.min(1900), Validators.max(2025)]],
      death_year: [null, [Validators.min(1900), Validators.max(2025)]],
      country_ca: [''],
      country_es: [''],
      country_en: [''],
      summary_ca: [''],
      summary_es: [''],
      summary_en: [''],
    });
  }

  private detectMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mode = 'edit';
      this.biographyId = id;
      this.loadBiography(id);
    }
  }

  private loadBiography(id: string): void {
    this.loading = true;
    this.biographyService.getOne(id).subscribe({
      next: (bio) => this.patchForm(bio),
      error: (err) => {
        this.error = 'Error cargando la biografía: ' + (err.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  private patchForm(bio: Biography): void {
    this.form.patchValue({
      name_ca: bio.name_ca,
      name_es: bio.name_es || '',
      name_en: bio.name_en || '',
      birth_year: bio.birth_year || null,
      death_year: bio.death_year || null,
      country_ca: bio.country_ca || '',
      country_es: bio.country_es || '',
      country_en: bio.country_en || '',
      summary_ca: bio.summary_ca || '',
      summary_es: bio.summary_es || '',
      summary_en: bio.summary_en || '',
    });

    if (bio.portrait) {
      this.portraitPreview = this.pb.getFileUrlSync(
        { id: biographyId, collectionId: bio.collectionId, collectionName: 'biography' },
        bio.portrait,
        { thumb: '400x400' }
      );
    }

    this.loading = false;
  }

  onFileSelect(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.portraitFile = file;
      this.portraitToDelete = false;
      this.error = '';

      // Preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => this.portraitPreview = e.target?.result as string;
        reader.readAsDataURL(file);
      } else {
        this.portraitPreview = null;
      }
    }
  }

  removePortrait(): void {
    this.portraitFile = null;
    this.portraitPreview = null;
    this.portraitToDelete = true;
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
        name_ca: formValue.name_ca,
        name_es: formValue.name_es,
        name_en: formValue.name_en,
        birth_year: formValue.birth_year || null,
        death_year: formValue.death_year || null,
        country_ca: formValue.country_ca || null,
        country_es: formValue.country_es || null,
        country_en: formValue.country_en || null,
        summary_ca: formValue.summary_ca || null,
        summary_es: formValue.summary_es || null,
        summary_en: formValue.summary_en || null,
      };

      if (this.mode === 'create') {
        await this.biographyService.create(body).toPromise();
      } else {
        await this.biographyService.update(this.biographyId!, body).toPromise();
      }

      // Handle portrait file upload after creating/updating
      if (this.portraitFile && this.mode === 'create') {
        // For now, just navigate back - file upload can be handled separately
      }

      await this.router.navigate(['/admin/biography']);
    } catch (err: unknown) {
      const pbError = err as { response?: { data?: { message?: string } }; message?: string };
      this.error = pbError.response?.data?.message || pbError.message || 'Error guardando la biografía';
      this.saving = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/biography']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }
}