import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, of, combineLatest } from 'rxjs';
import { PocketBaseService, ListResult, FilterOptions } from '../../../core/services/pocketbase';
import { News, Locale } from '../../../core/services/pocketbase/models';
import { TranslationService } from '../../../core/i18n/translation.service';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private pb = inject(PocketBaseService);
  private translationService = inject(TranslationService);
  private readonly COLLECTION = 'news';

  getPublishedList(options: FilterOptions = {}): Observable<ListResult<News>> {
    const defaultOptions: FilterOptions = {
      filter: 'status="published"',
      sort: '-published_at',
      page: 1,
      perPage: 10,
      expand: 'category,cover',
      ...options,
    };
    return this.pb.getList<News>(this.COLLECTION, defaultOptions);
  }

  getPublishedAll(options: FilterOptions = {}): Observable<News[]> {
    return this.pb.getFullList<News>(this.COLLECTION, {
      filter: 'status="published"',
      sort: '-published_at',
      expand: 'category,cover',
      ...options,
    });
  }

  getFeatured(limit = 3): Observable<News[]> {
    return this.pb.getFullList<News>(this.COLLECTION, {
      filter: 'status="published" && featured=true',
      sort: '-published_at',
      perPage: limit,
      expand: 'category,cover',
    });
  }

  getBySlug(slug: string): Observable<News | null> {
    return from(this.pb.getFirstListItem<News>(this.COLLECTION, `slug="${slug}" && status="published"`, { expand: 'category,cover' })).pipe(
      catchError(() => of(null))
    );
  }

  getByCategory(categorySlug: string, options: FilterOptions = {}): Observable<ListResult<News>> {
    return this.pb.getList<News>(this.COLLECTION, {
      filter: `status="published" && category.slug="${categorySlug}"`,
      sort: '-published_at',
      expand: 'category,cover',
      ...options,
    });
  }

  search(query: string, options: FilterOptions = {}): Observable<ListResult<News>> {
    const searchFilter = `status="published" && (title_ca~"${query}" || title_es~"${query}" || title_en~"${query}" || excerpt_ca~"${query}" || excerpt_es~"${query}" || excerpt_en~"${query}" || content_ca~"${query}" || content_es~"${query}" || content_en~"${query}")`;
    return this.pb.getList<News>(this.COLLECTION, {
      filter: searchFilter,
      sort: '-published_at',
      expand: 'category,cover',
      ...options,
    });
  }

  getLatest(limit = 5): Observable<News[]> {
    return this.pb.getFullList<News>(this.COLLECTION, {
      filter: 'status="published"',
      sort: '-published_at',
      perPage: limit,
      expand: 'category,cover',
    });
  }

  getCoverUrl(news: News, thumb?: string): string | null {
    if (!news.cover) return null;
    const record = { id: news.id, collectionId: news.collectionId, collectionName: this.COLLECTION };
    return this.pb.getFileUrlSync(record, news.cover, { thumb });
  }

  getLocalizedTitle(news: News, locale?: Locale): string {
    const currentLocale = locale || this.translationService.getCurrentLocale();
    return this.pb.getLocalizedField(news, 'title', currentLocale);
  }

  getLocalizedExcerpt(news: News, locale?: Locale): string {
    const currentLocale = locale || this.translationService.getCurrentLocale();
    return this.pb.getLocalizedField(news, 'excerpt', currentLocale);
  }

  getLocalizedContent(news: News, locale?: Locale): string {
    const currentLocale = locale || this.translationService.getCurrentLocale();
    return this.pb.getLocalizedField(news, 'content', currentLocale);
  }

  getLocalizedSeoTitle(news: News, locale?: Locale): string {
    const currentLocale = locale || this.translationService.getCurrentLocale();
    return this.pb.getLocalizedField(news, 'seo_title', currentLocale) || this.getLocalizedTitle(news, currentLocale);
  }

  getLocalizedSeoDescription(news: News, locale?: Locale): string {
    const currentLocale = locale || this.translationService.getCurrentLocale();
    return this.pb.getLocalizedField(news, 'seo_description', currentLocale) || this.getLocalizedExcerpt(news, currentLocale);
  }
}