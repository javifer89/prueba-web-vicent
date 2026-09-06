import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, startWith, map, catchError, of } from 'rxjs';
import { GalleryAdminService } from './galleries-admin.service';
import { Gallery } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-admin-galleries-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './admin-galleries-list.component.html',
})
export class AdminGalleriesListComponent implements OnInit {
  private galleryService = inject(GalleryAdminService);
  private pb = inject(PocketBaseService);

  galleries$!: Observable<Gallery[]>;
  loading = true;
  searchTerm = '';
  statusFilter: 'all' | 'draft' | 'published' = 'all';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.galleries$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.loadGalleries(term))
    );

    this.searchSubject.next('');
  }

  private loadGalleries(search: string): Observable<Gallery[]> {
    this.loading = true;
    let filter = '';

    if (this.statusFilter !== 'all') {
      filter = `status="${this.statusFilter}"`;
    }

    if (search) {
      const searchFilter = `(title_ca~"${search}" || title_es~"${search}" || title_en~"${search}")`;
      filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
    }

    return this.galleryService.getList(1, 30, { filter, sort: '-created', expand: 'images,category' }).pipe(
      map((result: any) => {
        this.loading = false;
        return result.items;
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

  onStatusChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onDelete(gallery: Gallery): void {
    if (!confirm(`¿Eliminar "${gallery.title_ca}"? Esta acción no se puede deshacer.`)) return;
    this.galleryService.delete(gallery.id).subscribe({
      next: () => this.searchSubject.next(this.searchTerm),
      error: err => console.error('Error eliminando:', err),
    });
  }
}