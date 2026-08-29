import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, startWith, map, catchError, of } from 'rxjs';
import { NewsAdminService } from './news-admin.service';
import { News, ContentStatus, TranslationStatus } from '../../../core/services/pocketbase/models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-admin-news-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-news-list.component.html',
  styleUrls: ['./admin-news-list.component.scss'],
})
export class AdminNewsListComponent implements OnInit {
  private newsService = inject(NewsAdminService);

  news$!: Observable<News[]>;
  loading = true;
  searchTerm = '';
  statusFilter: ContentStatus | 'all' = 'all';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.news$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.loadNews(term))
    );

    this.searchSubject.next('');
  }

  private loadNews(search: string): Observable<News[]> {
    this.loading = true;
    let filter = '';

    if (this.statusFilter !== 'all') {
      filter = `status="${this.statusFilter}"`;
    }

    if (search) {
      const searchFilter = `(title_ca~"${search}" || title_es~"${search}" || title_en~"${search}" || excerpt_ca~"${search}" || excerpt_es~"${search}" || excerpt_en~"${search}")`;
      filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
    }

    return this.newsService.getAll({ filter, sort: '-published_at,-created', expand: 'category' }).pipe(
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

  onStatusChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onPublish(news: News): void {
    if (news.status === 'published') return;
    this.newsService.publish(news.id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error publicando:', err),
    });
  }

  onUnpublish(news: News): void {
    if (news.status === 'draft') return;
    this.newsService.unpublish(news.id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error despublicando:', err),
    });
  }

  onArchive(news: News): void {
    this.newsService.archive(news.id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error archivando:', err),
    });
  }

  onDelete(news: News): void {
    if (!confirm(`¿Eliminar "${news.title_ca}"? Esta acción no se puede deshacer.`)) return;
    this.newsService.delete(news.id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error eliminando:', err),
    });
  }

  private refresh(): void {
    this.searchSubject.next(this.searchTerm);
  }

  getStatusLabel(status: ContentStatus): string {
    return this.newsService.getStatusLabel(status);
  }

  getStatusClass(status: ContentStatus): string {
    return this.newsService.getStatusClass(status);
  }

  getTranslationStatusLabel(status: TranslationStatus): string {
    return this.newsService.getTranslationStatusLabel(status);
  }

  getTranslationStatusClass(status: TranslationStatus): string {
    return this.newsService.getTranslationStatusClass(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getCategoryName(category: string | { name_ca: string; name_es: string; name_en: string }): string {
    if (typeof category === 'object' && category) {
      return category.name_ca || category.name_es || category.name_en || '';
    }
    return '';
  }
}