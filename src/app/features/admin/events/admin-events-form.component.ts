import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, catchError, of, switchMap } from 'rxjs';
import { EventsAdminService } from './events-admin.service';
import { Event, Category, EventStatus } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type EditorMode = 'create' | 'edit';

@Component({
  selector: 'app-admin-events-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-events-form.component.html',
  styleUrls: ['./admin-events-form.component.scss'],
})
export class AdminEventsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventsService = inject(EventsAdminService);
  private pb = inject(PocketBaseService);

  mode: EditorMode = 'create';
  eventId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  form!: FormGroup;
  coverPreview: string | null = null;
  coverFile: File | null = null;
  coverToDelete = false;
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
      title_ca: ['', Validators.required],
      title_es: [''],
      title_en: [''],
      description_ca: ['', Validators.required],
      description_es: [''],
      description_en: [''],
      date: ['', Validators.required],
      time: [''],
      place: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      program_ca: [''],
      program_es: [''],
      program_en: [''],
      performers_ca: [''],
      performers_es: [''],
      performers_en: [''],
      url: [''],
      status: ['upcoming' as EventStatus, Validators.required],
      featured: [false],
      category: [''],
    });
  }

  private loadCategories(): void {
    this.categories$ = this.pb.getFullList<Category>('categories', {
      filter: 'type="events"',
      sort: 'name_ca',
    });
  }

  private detectMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mode = 'edit';
      this.eventId = id;
      this.loadEvent(id);
    }
  }

  private loadEvent(id: string): void {
    this.loading = true;
    this.eventsService.getOne(id).subscribe({
      next: (event) => this.patchForm(event),
      error: (err) => {
        this.error = 'Error cargando el evento: ' + (err.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  private patchForm(event: Event): void {
    this.form.patchValue({
      title_ca: event.title_ca,
      title_es: event.title_es || '',
      title_en: event.title_en || '',
      description_ca: event.description_ca,
      description_es: event.description_es || '',
      description_en: event.description_en || '',
      date: event.date.split('T')[0],
      time: event.time || '',
      place: event.place,
      city: event.city,
      country: event.country,
      program_ca: event.program_ca || '',
      program_es: event.program_es || '',
      program_en: event.program_en || '',
      performers_ca: event.performers_ca || '',
      performers_es: event.performers_es || '',
      performers_en: event.performers_en || '',
      url: event.url || '',
      status: event.status,
      featured: event.featured,
      category: event.category || '',
    });

    if (event.image) {
      this.coverPreview = this.pb.getFileUrlSync(
        { id: event.id, collectionId: event.collectionId, collectionName: 'events' },
        event.image,
        { thumb: '400x300' }
      );
    }

    this.loading = false;
  }

  setActiveLocale(locale: 'ca' | 'es' | 'en'): void {
    this.activeLocale = locale;
  }

  onCoverSelect(e: any): void {
    const input = e.target as HTMLInputElement;
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

  async onSaveDraft(): Promise<void> {
    await this.submit('upcoming');
  }

  async onPublish(): Promise<void> {
    await this.submit('upcoming');
  }

  private async submit(status: EventStatus): Promise<void> {
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
        await this.eventsService.create(body).toPromise();
      } else {
        await this.eventsService.update(this.eventId!, body).toPromise();
      }

      if (this.coverFile || this.coverToDelete) {
        await this.handleCoverUpload(this.mode === 'create' ? null : this.eventId!);
      }

      await this.router.navigate(['/admin/events']);
    } catch (err: unknown) {
      const pbError = err as { response?: { data?: { message?: string } }; message?: string };
      this.error = pbError.response?.data?.message || pbError.message || 'Error guardando el evento';
      this.saving = false;
    }
  }

  private async handleCoverUpload(recordId: string | null): Promise<void> {
    if (this.coverToDelete && recordId) {
      await this.eventsService.deleteCover(recordId);
      return;
    }
    if (this.coverFile && recordId) {
      await this.eventsService.uploadCover(this.coverFile);
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/events']);
  }

  get f() {
    return this.form.controls;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }
}