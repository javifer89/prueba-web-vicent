import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, startWith, map, catchError, of } from 'rxjs';
import { MediaAdminService } from './media-admin.service';
import { Media, Category, MediaType, PlatformType } from '../../../core/services/pocketbase/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { PocketBaseService } from '../../../core/services/pocketbase';

@Component({
  selector: 'app-admin-media-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-media-list.component.html',
  styleUrls: ['./admin-media-list.component.scss'],
})
export class AdminMediaListComponent implements OnInit {
  private mediaService = inject(MediaAdminService);
  private pb = inject(PocketBaseService);

  media$!: Observable<Media[]>;
  loading = true;
  searchTerm = '';
  typeFilter: MediaType | 'all' = 'all';
  platformFilter: PlatformType | 'all' = 'all';
  private searchSubject = new Subject<string>();

  typeOptions: { value: MediaType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'image', label: 'Imágenes' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
    { value: 'document', label: 'Documentos' },
  ];

  platformOptions: { value: PlatformType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo', label: 'Vimeo' },
    { value: 'soundcloud', label: 'SoundCloud' },
    { value: 'custom', label: 'Personalizado' },
    { value: 'direct', label: 'Directo' },
  ];

  ngOnInit(): void {
    this.media$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.loadMedia(term))
    );

    this.searchSubject.next('');
  }

  private loadMedia(search: string): Observable<any[]> {
    this.loading = true;
    let filter = '';

    if (this.typeFilter !== 'all') {
      filter = `type="${this.typeFilter}"`;
    }

    if (this.platformFilter !== 'all') {
      const platformFilter = `platform="${this.platformFilter}"`;
      filter = filter ? `${filter} && ${platformFilter}` : platformFilter;
    }

    if (search) {
      const searchFilter = `(title_ca~"${search}" || title_es~"${search}" || title_en~"${search}" || description_ca~"${search}" || description_es~"${search}" || description_en~"${search}")`;
      filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
    }

    return this.mediaService.getAll({ filter, sort: '-created', expand: 'category' }).pipe(
      map(result => {
        this.loading = false;
        return result;
      }),
      catchError(() => {
        this.loading = false;
        return of([]);
      })
    );
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onTypeChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onPlatformChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onDelete(media: Media): void {
    if (!confirm(`¿Eliminar "${media.title_ca}"? Esta acción no se puede deshacer.`)) return;
    this.mediaService.delete(media.id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error eliminando:', err),
    });
  }

  private refresh(): void {
    this.searchSubject.next(this.searchTerm);
  }

  getTypeLabel(type: MediaType): string {
    return this.mediaService.getTypeLabel(type);
  }

  getPlatformLabel(platform: PlatformType): string {
    return this.mediaService.getPlatformLabel(platform);
  }

  getCategoryName(category: string | Category): string {
    if (!category) return '';
    if (typeof category === 'object' && category.name_ca) {
      return category.name_ca;
    }
    return String(category);
  }

  getFileUrl(media: any): string {
    const fileName = media['file'];
    if (!fileName) return '';
    return this.pb.getFileUrlSync(
      { id: media.id, collectionId: media.collectionId, collectionName: 'media' },
      fileName
    );
  }

  isExternal(media: any): boolean {
    return media.platform && media.external_url;
  }

  getMediaTitle(media: Media): string {
    return media.title_ca || media.title_es || media.title_en || 'Sin título';
  }
}