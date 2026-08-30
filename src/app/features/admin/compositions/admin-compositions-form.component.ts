import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { CompositionsAdminService } from './compositions-admin.service';
import { Composition, Category, ContentStatus } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-compositions-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-compositions-form.component.html',
  styleUrls: ['./admin-compositions-form.component.scss'],
})
export class AdminCompositionsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private compositionsService = inject(CompositionsAdminService);
  private pb = inject(PocketBaseService);

  mode: EditorMode = 'create';
  compositionId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  form!: FormGroup;
  categories$!: Observable<Category[]>;

  locales = ['ca', 'es', 'en'] as const;
  localeLabels = { ca: 'Valenciano (fuente)', es: 'Castellano', en: 'Inglés' };
  activeLocale = 'ca' as 'ca' | 'es' | 'en';

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.detectMode();
  }

  private initForm(): void {
    this.form = this.fb.nonNullable.group({
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      title_ca: ['', Validators.required],
      title_es: [''],
      title_en: [''],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
      duration: [''],
      instrumentation_ca: ['', Validators.required],
      instrumentation_es: [''],
      instrumentation_en: [''],
      category: [''],
      description_ca: ['', Validators.required],
      description_es: [''],
      description_en: [''],
      premiere_date: [''],
      premiere_place: [''],
      premiere_performers: [[]],
      premiere_director: [''],
      premiere_festival: [''],
      files: [[]],
      recordings: [[]],
      videos: [[]],
      images: [[]],
      performers: [[]],
      notes_ca: [''],
      notes_es: [''],
      notes_en: [''],
      status: ['draft' as ContentStatus, Validators.required],
      featured: [false],
    });
  }

  private loadCategories(): void {
    this.categories$ = this.pb.getFullList<Category>('categories', {
      filter: 'type="compositions"',
      sort: 'name_ca',
    });
  }

  private detectMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mode = 'edit';
      this.compositionId = id;
      this.loadComposition(id);
    }
  }

  private loadComposition(id: string): void {
    this.loading = true;
    this.compositionsService.getOne(id).subscribe({
      next: (comp) => this.patchForm(comp),
      error: (err) => {
        this.error = 'Error cargando la composición: ' + (err.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  private patchForm(comp: Composition): void {
    this.form.patchValue({
      slug: comp.slug,
      title_ca: comp.title_ca,
      title_es: comp.title_es || '',
      title_en: comp.title_en || '',
      year: comp.year,
      duration: comp.duration || '',
      instrumentation_ca: comp.instrumentation_ca,
      instrumentation_es: comp.instrumentation_es || '',
      instrumentation_en: comp.instrumentation_en || '',
      category: comp.category || '',
      description_ca: comp.description_ca,
      description_es: comp.description_es || '',
      description_en: comp.description_en || '',
      premiere_date: comp.premiere_date ? comp.premiere_date.split('T')[0] : '',
      premiere_place: comp.premiere_place || '',
      premiere_performers: comp.premiere_performers || [],
      premiere_director: comp.premiere_director || '',
      premiere_festival: comp.premiere_festival || '',
      files: comp.files || [],
      recordings: comp.recordings || [],
      videos: comp.videos || [],
      images: comp.images || [],
      performers: comp.performers || [],
      notes_ca: comp.notes_ca || '',
      notes_es: comp.notes_es || '',
      notes_en: comp.notes_en || '',
      status: comp.status,
      featured: comp.featured,
    });
    this.loading = false;
  }

  generateSlug(): void {
    const title = this.form.get('title_ca')?.value || '';
    const slug = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 80);
    this.form.get('slug')?.setValue(slug);
  }

  async onSaveDraft(): Promise<void> {
    await this.submit('draft');
  }

  async onPublish(): Promise<void> {
    await this.submit('published');
  }

  async onArchive(): Promise<void> {
    await this.submit('archived');
  }

  private async submit(status: ContentStatus): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const formValue = this.form.getRawValue();
    const body = {
      ...formValue,
      status,
    };

    try {
      if (this.mode === 'create') {
        await this.compositionsService.create(body).toPromise();
      } else {
        await this.compositionsService.update(this.compositionId!, body).toPromise();
      }

      await this.router.navigate(['/admin/compositions']);
    } catch (err: unknown) {
      const pbError = err as { response?: { data?: { message?: string } }; message?: string };
      this.error = pbError.response?.data?.message || pbError.message || 'Error guardando la composición';
      this.saving = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/compositions']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }
}