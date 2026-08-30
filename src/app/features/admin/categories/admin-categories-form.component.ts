import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { CategoriesAdminService } from './categories-admin.service';
import { CategoryType } from '../../../core/services/pocketbase/models';
import { Category } from '../../../core/services/pocketbase/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-categories-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-categories-form.component.html',
  styleUrls: ['./admin-categories-form.component.scss'],
})
export class AdminCategoriesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoriesService = inject(CategoriesAdminService);

  mode: EditorMode = 'create';
  categoryId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  form!: FormGroup;

  typeOptions: { value: CategoryType; label: string }[] = [
    { value: 'news', label: 'Noticias' },
    { value: 'events', label: 'Eventos' },
    { value: 'compositions', label: 'Composiciones' },
    { value: 'media', label: 'Multimedia' },
    { value: 'gallery', label: 'Galería' },
  ];

  activeLocale = 'ca' as 'ca' | 'es' | 'en';
      localeLabels = { ca: 'Valenciano (fuente)', es: 'Castellano', en: 'Inglés' };

      ngOnInit(): void {
    this.initForm();
    this.detectMode();
  }

  private initForm(): void {
    this.form = this.fb.nonNullable.group({
      name_ca: ['', Validators.required],
      name_es: ['', Validators.required],
      name_en: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      type: ['news' as CategoryType, Validators.required],
      order: [0],
      color: ['', Validators.pattern('^#[0-9a-fA-F]{6}$')],
    });
  }

  private detectMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mode = 'edit';
      this.categoryId = id;
      this.loadCategory(id);
    }
  }

  private loadCategory(id: string): void {
    this.loading = true;
    this.categoriesService.getOne(id).subscribe({
      next: (cat) => this.patchForm(cat),
      error: (err) => {
        this.error = 'Error cargando la categoría: ' + (err.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  private patchForm(cat: Category): void {
    this.form.patchValue({
      name_ca: cat.name_ca,
      name_es: cat.name_es,
      name_en: cat.name_en,
      slug: cat.slug,
      type: cat.type,
      order: cat.order || 0,
      color: cat.color || '',
    });
    this.loading = false;
  }

  generateSlug(): void {
    const name = this.form.get('name_ca')?.value || '';
    const slug = this.categoriesService.generateSlug(name);
    this.form.get('slug')?.setValue(slug);
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
        slug: formValue.slug,
        type: formValue.type,
        order: formValue.order,
        color: formValue.color || null,
      };

      if (this.mode === 'create') {
        await this.categoriesService.create(body).toPromise();
      } else {
        await this.categoriesService.update(this.categoryId!, body).toPromise();
      }

      await this.router.navigate(['/admin/categories']);
    } catch (err: unknown) {
      const pbError = err as { response?: { data?: { message?: string } }; message?: string };
      this.error = pbError.response?.data?.message || pbError.message || 'Error guardando la categoría';
      this.saving = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }

  getTypeLabel(type: CategoryType): string {
    return this.categoriesService.getTypeLabel(type);
  }
}