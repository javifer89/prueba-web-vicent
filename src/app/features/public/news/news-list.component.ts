import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map, startWith, switchMap, of, catchError } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { NewsService } from './news.service';
import { Category } from '../../../core/services/pocketbase/models';
import { PocketBaseService } from '../../../core/services/pocketbase';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';

interface CategoryWithCount extends Category {
  newsCount: number;
}

interface NewsPageResult {
  items: any[];
  totalItems: number;
  page: number;
  totalPages: number;
}

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
})
export class NewsListComponent implements OnInit {
  private newsService = inject(NewsService);
  private pb = inject(PocketBaseService);
  private translationService = inject(TranslationService);

  loading = signal(false);
  error = signal<string | null>(null);

  news$!: Observable<NewsPageResult>;
  categories$!: Observable<CategoryWithCount[]>;

  currentPage = signal(1);
  perPage = 9;
  selectedCategory = signal<string>('all');
  searchQuery = signal('');

  ngOnInit(): void {
    this.loadCategories();
    this.setupNewsStream();
  }

  private setupNewsStream(): void {
    const page$ = toObservable(this.currentPage);

    this.news$ = page$.pipe(
      startWith(this.currentPage()),
      switchMap(page => {
        this.loading.set(true);
        this.error.set(null);

        let filter = 'status="published"';
        if (this.selectedCategory() !== 'all') {
          filter += ` && category.slug="${this.selectedCategory()}"`;
        }
        if (this.searchQuery()) {
          const q = this.searchQuery().replace(/"/g, '\\"');
          filter += ` && (title_ca~"${q}" || title_es~"${q}" || title_en~"${q}" || excerpt_ca~"${q}" || excerpt_es~"${q}" || excerpt_en~"${q}" || content_ca~"${q}" || content_es~"${q}" || content_en~"${q}")`;
        }

        return this.newsService.getPublishedList({
          filter,
          sort: '-published_at',
          page,
          perPage: this.perPage,
          expand: 'category,cover',
        }).pipe(
          map(result => ({
            items: result.items,
            totalItems: result.totalItems,
            page: result.page,
            totalPages: result.totalPages,
          })),
          catchError(err => {
            this.error.set('Error cargando las noticias: ' + (err.message || 'Error desconocido'));
            return of({ items: [], totalItems: 0, page: 1, totalPages: 1 });
          })
        );
      })
    );
  }

  private loadCategories(): void {
    this.categories$ = this.pb.getFullList<Category>('categories', {
      filter: 'type="news"',
      sort: 'order,name_ca',
    }).pipe(
      map(cats => cats.map(cat => ({ ...cat, newsCount: 0 }))),
      catchError(() => of([]))
    );
  }

  onPageChange(page: number, totalPages: number): void {
    if (page >= 1 && page <= totalPages) {
      this.currentPage.set(page);
    }
  }

  onCategoryChange(slug: string): void {
    this.selectedCategory.set(slug);
    this.currentPage.set(1);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  getCoverUrl(news: any, thumb?: string): string | null {
    return this.newsService.getCoverUrl(news, thumb);
  }

  getLocalizedTitle(news: any): string {
    return this.newsService.getLocalizedTitle(news);
  }

  getLocalizedExcerpt(news: any): string {
    return this.newsService.getLocalizedExcerpt(news);
  }

  getCategoryName(category: any): string {
    if (!category) return '';
    if (typeof category === 'object' && category.name_ca) {
      return category.name_ca;
    }
    return category;
  }

  getPageNumbers(totalPages: number): number[] {
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getPageAriaLabel(page: number): string {
    return `${this.translationService.getContentSync('news.page')}: ${page}`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}