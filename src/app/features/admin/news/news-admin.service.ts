import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { PocketBaseService, ListResult, FilterOptions } from '../../../core/services/pocketbase';
import { News, NewsFormData, ContentStatus, Locale, TranslationStatus } from '../../../core/services/pocketbase/models';

@Injectable({
  providedIn: 'root',
})
export class NewsAdminService {
  private pb = inject(PocketBaseService);
  private readonly COLLECTION = 'news';

  getList(options: FilterOptions = {}): Observable<ListResult<News>> {
    const defaultOptions: FilterOptions = {
      sort: '-published_at,-created',
      page: 1,
      perPage: 20,
      expand: 'category',
      ...options,
    };
    return this.pb.getList<News>(this.COLLECTION, defaultOptions);
  }

  getAll(options: Omit<FilterOptions, 'page' | 'perPage'> = {}): Observable<News[]> {
    return this.pb.getFullList<News>(this.COLLECTION, {
      sort: '-published_at,-created',
      expand: 'category',
      ...options,
    });
  }

  getOne(id: string): Observable<News> {
    return this.pb.getOne<News>(this.COLLECTION, id, { expand: 'category' });
  }

  getBySlug(slug: string): Observable<News> {
    return this.pb.getFirstListItem<News>(this.COLLECTION, `slug="${slug}"`, { expand: 'category' });
  }

  create(data: NewsFormData): Observable<News> {
    const body = this.prepareBody(data);
    return this.pb.create<News>(this.COLLECTION, body, { expand: 'category' });
  }

  update(id: string, data: Partial<NewsFormData>): Observable<News> {
    const body = this.prepareBody(data);
    return this.pb.update<News>(this.COLLECTION, id, body, { expand: 'category' });
  }

  delete(id: string): Observable<boolean> {
    return this.pb.delete(this.COLLECTION, id);
  }

  publish(id: string): Observable<News> {
    return this.update(id, {
      status: 'published',
      published_at: new Date().toISOString(),
    } as Partial<NewsFormData>);
  }

  unpublish(id: string): Observable<News> {
    return this.update(id, {
      status: 'draft',
    } as Partial<NewsFormData>);
  }

  archive(id: string): Observable<News> {
    return this.update(id, {
      status: 'archived',
    } as Partial<NewsFormData>);
  }

  async uploadCover(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('cover', file);
    const result = await this.pb.client.collection(this.COLLECTION).create(formData);
    return result['cover'];
  }

  async deleteCover(id: string): Promise<void> {
    await this.pb.client.collection(this.COLLECTION).update(id, { 'cover-': '' });
  }

  private prepareBody(data: Partial<NewsFormData>): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (data['slug']) body['slug'] = data['slug'];
    if (data['status']) body['status'] = data['status'];
    if (data['featured'] !== undefined) body['featured'] = data['featured'];
    if (data['published_at']) body['published_at'] = data['published_at'];
    if (data['title_ca'] !== undefined) body['title_ca'] = data['title_ca'];
    if (data['title_es'] !== undefined) body['title_es'] = data['title_es'];
    if (data['title_en'] !== undefined) body['title_en'] = data['title_en'];
    if (data['excerpt_ca'] !== undefined) body['excerpt_ca'] = data['excerpt_ca'];
    if (data['excerpt_es'] !== undefined) body['excerpt_es'] = data['excerpt_es'];
    if (data['excerpt_en'] !== undefined) body['excerpt_en'] = data['excerpt_en'];
    if (data['content_ca'] !== undefined) body['content_ca'] = data['content_ca'];
    if (data['content_es'] !== undefined) body['content_es'] = data['content_es'];
    if (data['content_en'] !== undefined) body['content_en'] = data['content_en'];
    if (data['seo_title_ca'] !== undefined) body['seo_title_ca'] = data['seo_title_ca'];
    if (data['seo_title_es'] !== undefined) body['seo_title_es'] = data['seo_title_es'];
    if (data['seo_title_en'] !== undefined) body['seo_title_en'] = data['seo_title_en'];
    if (data['seo_description_ca'] !== undefined) body['seo_description_ca'] = data['seo_description_ca'];
    if (data['seo_description_es'] !== undefined) body['seo_description_es'] = data['seo_description_es'];
    if (data['seo_description_en'] !== undefined) body['seo_description_en'] = data['seo_description_en'];
    if (data['category']) body['category'] = data['category'];

    return body;
  }

  getStatusLabel(status: ContentStatus): string {
    const labels: Record<ContentStatus, string> = {
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado',
    };
    return labels[status] || status;
  }

  getStatusClass(status: ContentStatus): string {
    const classes: Record<ContentStatus, string> = {
      draft: 'status-draft',
      published: 'status-published',
      archived: 'status-archived',
    };
    return classes[status] || '';
  }

  getTranslationStatusLabel(status: TranslationStatus): string {
    const labels: Record<TranslationStatus, string> = {
      current: 'Actualizada',
      outdated: 'Desactualizada',
      pending: 'Pendiente',
      missing: 'Falta',
    };
    return labels[status] || status;
  }

  getTranslationStatusClass(status: TranslationStatus): string {
    const classes: Record<TranslationStatus, string> = {
      current: 'translation-current',
      outdated: 'translation-outdated',
      pending: 'translation-pending',
      missing: 'translation-missing',
    };
    return classes[status] || '';
  }

  getLocalizedTitle(news: News, locale: Locale): string {
    return this.pb.getLocalizedField(news, 'title', locale);
  }

  getLocalizedExcerpt(news: News, locale: Locale): string {
    return this.pb.getLocalizedField(news, 'excerpt', locale);
  }

  getLocalizedContent(news: News, locale: Locale): string {
    return this.pb.getLocalizedField(news, 'content', locale);
  }
}