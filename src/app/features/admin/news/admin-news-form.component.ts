import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { NewsAdminService } from './news-admin.service';
import { Category } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-news-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-news-form.component.html',
  styleUrls: ['./admin-news-form.component.scss'],
})
export class AdminNewsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private newsService = inject(NewsAdminService);
  private pb = inject(PocketBaseService);

  mode: EditorMode = 'create';
  newsId: string | null = null;
  loading = false;
  saving = false;
  error = '';
  categories$!: Observable<Category[]>;

  form!: FormGroup;
  coverPreview: string | null = null;
  coverFile: File | null = null;
  coverToDelete = false;

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
      status: ['draft' as const, Validators.required],
      featured: [false],
      published_at: [''],
      title_ca: ['', Validators.required],
      title_es: [''],
      title_en: [''],
      excerpt_ca: ['', Validators.required],
      excerpt_es: [''],
      excerpt_en: [''],
      content_ca: ['', Validators.required],
      content_es: [''],
      content_en: [''],
      seo_title_ca: [''],
      seo_title_es: [''],
      seo_title_en: [''],
      seo_description_ca: [''],
      seo_description_es: [''],
      seo_description_en: [''],
      category: [''],
    });
  }

  private loadCategories(): void {
    this.categories$ = this.pb.getFullList<Category>('categories', {
      filter: 'type="news"',
      sort: 'order,name_ca',
    });
  }

  private detectMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mode = 'edit';
      this.newsId = id;
      this.loadNews(id);
    }
  }

  private loadNews(id: string): void {
    this.loading = true;
    this.newsService.getOne(id).subscribe({
      next: (news) => this.patchForm(news),
      error: (err) => {
        this.error = 'Error cargando la noticia: ' + (err.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  private patchForm(news: any): void {
    this.form.patchValue({
      slug: news.slug,
      status: news.status,
      featured: news.featured,
      published_at: news.published_at ? news.published_at.split('T')[0] : '',
      title_ca: news.title_ca,
      title_es: news.title_es || '',
      title_en: news.title_en || '',
      excerpt_ca: news.excerpt_ca,
      excerpt_es: news.excerpt_es || '',
      excerpt_en: news.excerpt_en || '',
      content_ca: news.content_ca,
      content_es: news.content_es || '',
      content_en: news.content_en || '',
      seo_title_ca: news.seo_title_ca || '',
      seo_title_es: news.seo_title_es || '',
      seo_title_en: news.seo_title_en || '',
      seo_description_ca: news.seo_description_ca || '',
      seo_description_es: news.seo_description_es || '',
      seo_description_en: news.seo_description_en || '',
      category: news.category || '',
    });

    if (news.cover) {
      this.coverPreview = this.pb.getFileUrlSync(
        { id: news.id, collectionId: news.collectionId, collectionName: 'news' },
        news.cover,
        { thumb: '400x300' }
      );
    }

    this.loading = false;
  }

  setActiveLocale(locale: 'ca' | 'es' | 'en'): void {
    this.activeLocale = locale;
  }

  onCoverSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        this.error = 'Formato no válido. Usa JPG, PNG o WebP.';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.error = 'La imagen supera los 10 MB.';
        return;
      }
      this.coverFile = file;
      this.coverToDelete = false;
      this.error = '';

      const reader = new FileReader();
      reader.onload = (e) => this.coverPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  removeCover(): void {
    this.coverFile = null;
    this.coverPreview = null;
    this.coverToDelete = true;
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

  private async submit(status: 'draft' | 'published'): Promise<void> {
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
      published_at: status === 'published' && !formValue.published_at ? new Date().toISOString() : formValue.published_at || null,
    };

    try {
      if (this.mode === 'create') {
        await this.newsService.create(body).toPromise();
      } else {
        await this.newsService.update(this.newsId!, body).toPromise();
      }

      if (this.coverFile || this.coverToDelete) {
        await this.handleCoverUpload(this.mode === 'create' ? null : this.newsId!);
      }

      await this.router.navigate(['/admin/news']);
    } catch (err: unknown) {
      const pbError = err as { response?: { data?: { message?: string } }; message?: string };
      this.error = pbError.response?.data?.message || pbError.message || 'Error guardando la noticia';
      this.saving = false;
    }
  }

  private async handleCoverUpload(recordId: string | null): Promise<void> {
    if (this.coverToDelete && recordId) {
      await this.newsService.deleteCover(recordId);
      return;
    }
    if (this.coverFile && recordId) {
      await this.newsService.uploadCover(this.coverFile);
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/news']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }
}